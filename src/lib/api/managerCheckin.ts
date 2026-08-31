import { db } from '../storage/db';
import { STORAGE_KEYS } from '../storage/keys';
import { createId } from '../utils/id';
import { User } from '../types';
import { managerEnquiriesApi } from './managerEnquiries';

export const managerCheckinApi = {
  getVacantBeds: (propertyId: string) => {
    if (!propertyId) return [];
    const rooms = db.getAll<any>(STORAGE_KEYS.ROOMS).filter(r => r.propertyId === propertyId && !r.isDeleted);
    const roomIds = rooms.map(r => r.id);
    const beds = db.getAll<any>(STORAGE_KEYS.BEDS).filter(b => roomIds.includes(b.roomId) && (b.status === 'vacant' || b.status === 'available' || b.status === 'Vacant') && !b.isDeleted);
    
    return beds.map(b => {
      const room = rooms.find(r => r.id === b.roomId);
      return {
        ...b,
        roomNumber: room?.number || room?.roomNumber
      };
    });
  },

  getCompatibilityScore: (roomId: string, currentStudentAnswers: any, newStudentAnswers: any) => {
    // Mock simple compatibility score
    // In real app, we would fetch existing occupying student answers in this room
    return Math.floor(Math.random() * 40) + 60; // 60-100 score
  },

  commitCheckin: (data: any) => {
    const now = new Date().toISOString();
    const actorId = data.managerId || 'system';

    // 1. Create Parent User & Profile if provided
    let parentId = '';
    if (data.parent.name && data.parent.phone) {
      const pUser: User = {
        id: createId('usr'),
        role: 'parent',
        name: data.parent.name,
        email: data.parent.email || `parent_${data.parent.phone}@example.com`,
        phone: data.parent.phone,
        password: data.credentials.password || 'Parent@123',
        status: 'Active',
        createdAt: now, updatedAt: now, createdBy: actorId, updatedBy: actorId, isDeleted: false
      };
      db.insert(STORAGE_KEYS.USERS, pUser);

      const pProfile = {
        id: createId('par'),
        userId: pUser.id,
        relation: 'parent',
        createdAt: now, updatedAt: now, createdBy: actorId, updatedBy: actorId, isDeleted: false
      };
      db.insert(STORAGE_KEYS.PARENTS, pProfile);
      parentId = pUser.id; // Or profile ID depending on relation mapping, we use user ID for simplicity
    }

    // 2. Create Student User
    const tUser: User = {
      id: createId('usr'),
      role: 'student',
      name: data.personal.name,
      email: data.personal.email,
      phone: data.personal.phone,
      password: data.credentials.password || 'Student@123',
      status: 'Active',
      mustChangePassword: true,
      createdAt: now, updatedAt: now, createdBy: actorId, updatedBy: actorId, isDeleted: false
    };
    db.insert(STORAGE_KEYS.USERS, tUser);

    // Calculate Stay Dates
    const stayStartDate = new Date();
    const stayEndDate = new Date(stayStartDate);
    stayEndDate.setMonth(stayEndDate.getMonth() + Number(data.deposit.stayDuration || 3));

    // 3. Create Student Profile
    const tProfile = {
      id: createId('ten'),
      userId: tUser.id,
      propertyId: data.propertyId,
      roomId: data.room.roomId,
      bedId: data.room.bedId,
      status: 'active',
      rentAmount: parseInt(data.deposit.rentAmount) || 0,
      duesAmount: 0,
      pgScore: 100,
      parentId,
      parentName: data.parent.name,
      parentPhone: data.parent.phone,
      agreementAccepted: data.agreement.accepted,
      agreementTimestamp: data.agreement.accepted ? now : undefined,
      stayStartDate: stayStartDate.toISOString().split('T')[0],
      stayEndDate: stayEndDate.toISOString().split('T')[0],
      aadharNumber: data.documents?.aadharNumber || '',
      panNumber: data.documents?.panNumber || '',
      createdAt: now, updatedAt: now, createdBy: actorId, updatedBy: actorId, isDeleted: false
    };
    db.insert(STORAGE_KEYS.STUDENTS, tProfile);

    // Generate Rent Schedule (Invoices)
    let totalDues = 0;
    let current = new Date(stayStartDate);
    while (current <= stayEndDate) {
      const monthYear = current.toLocaleString('default', { month: 'short', year: 'numeric' });
      db.insert(STORAGE_KEYS.INVOICES, {
        id: createId('inv'),
        propertyId: data.propertyId,
        studentId: tUser.id,
        amount: parseInt(data.deposit.rentAmount) || 0,
        status: 'Pending',
        type: 'Rent',
        dueDate: new Date(current.getFullYear(), current.getMonth(), 5).toISOString(),
        description: `Rent for ${monthYear}`,
        createdAt: now,
        updatedAt: now,
        createdBy: actorId,
        updatedBy: actorId,
        isDeleted: false
      });
      totalDues += (parseInt(data.deposit.rentAmount) || 0);
      current.setMonth(current.getMonth() + 1);
    }
    
    // Update initial dues
    db.update(STORAGE_KEYS.STUDENTS, tProfile.id, {
      duesAmount: totalDues
    });

    // 4. Mark Bed as Occupied
    db.update<any>(STORAGE_KEYS.BEDS, data.room.bedId, {
      status: 'Occupied',
      studentId: tUser.id,
      updatedAt: now,
      updatedBy: actorId
    });

    // 5. Save Documents
    if (data.documents.files && data.documents.files.length > 0) {
      data.documents.files.forEach((file: any) => {
        db.insert(STORAGE_KEYS.DOCUMENTS, {
          id: createId('doc'),
          uploaderId: tUser.id,
          propertyId: data.propertyId,
          type: 'id_proof',
          url: file.name, // mock storing filename as URL
          status: 'verified',
          createdAt: now, updatedAt: now, createdBy: actorId, updatedBy: actorId, isDeleted: false
        });
      });
    }

    // 6. Create Agreement
    if (data.agreement.accepted) {
      db.insert(STORAGE_KEYS.AGREEMENTS, {
        id: createId('agr'),
        studentId: tUser.id,
        propertyId: data.propertyId,
        depositType: data.deposit.type,
        loanPartner: data.deposit.loanPartner,
        acceptedAt: now,
        createdAt: now, updatedAt: now, createdBy: actorId, updatedBy: actorId, isDeleted: false
      });
    }

    // 7. Initialize Mess Wallet
    db.insert(STORAGE_KEYS.WALLETS, {
      id: createId('wal'),
      studentId: tUser.id,
      balance: 0,
      createdAt: now, updatedAt: now, createdBy: actorId, updatedBy: actorId, isDeleted: false
    });

    // 8. If from Enquiry, mark converted
    if (data.enquiryId) {
      managerEnquiriesApi.updateStatus(data.enquiryId, 'converted', actorId);
    }

    // 9. Audit Log
    db.insert(STORAGE_KEYS.AUDIT_LOGS, {
      id: createId('aud'),
      action: 'STUDENT_CHECKED_IN',
      actorId: actorId,
      targetId: tUser.id,
      details: `Checked in ${data.personal.name} to bed ${data.room.bedId}`,
      createdAt: now, updatedAt: now, createdBy: actorId, updatedBy: actorId, isDeleted: false
    });

    return { success: true, studentUserId: tUser.id };
  }
};
