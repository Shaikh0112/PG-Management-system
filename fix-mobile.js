const fs = require('fs');
const path = require('path');

const layouts = [
  {
    file: 'src/app/manager/components/ManagerLayout.tsx',
    oldHeader: `<div className="md:hidden flex items-center justify-between bg-[var(--bg-header)] p-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
          <ShieldAlert className="text-[var(--primary)] w-6 h-6" />
          <span>ManagerOps</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-primary)] ml-2">
            <Menu />
          </button>
        </div>
      </div>`,
    newHeader: `<div className="md:hidden flex items-center justify-between bg-[var(--bg-header)] p-3 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-primary)] p-1">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1 font-bold text-[var(--text-primary)]">
            <ShieldAlert className="text-[var(--primary)] w-5 h-5 hidden sm:block" />
            <span className="hidden sm:block">ManagerOps</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-[var(--text-secondary)] max-w-[80px] truncate">
            {user?.name || 'Manager'}
          </div>
          <button onClick={handleLogout} className="text-xs bg-[var(--danger-bg)] text-[var(--danger)] px-2 py-1.5 rounded-md font-bold flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>`
  },
  {
    file: 'src/app/owner/components/OwnerLayout.tsx',
    oldHeader: `<div className="md:hidden flex items-center justify-between bg-[var(--bg-header)] p-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
          <Building className="text-[var(--primary)] w-6 h-6" />
          <span>SmartPG Owner</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-primary)] ml-2">
            <Menu />
          </button>
        </div>
      </div>`,
    newHeader: `<div className="md:hidden flex items-center justify-between bg-[var(--bg-header)] p-3 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-primary)] p-1">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1 font-bold text-[var(--text-primary)]">
            <Building className="text-[var(--primary)] w-5 h-5 hidden sm:block" />
            <span className="hidden sm:block">SmartPG Owner</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-[var(--text-secondary)] max-w-[80px] truncate">
            {user?.name || 'Owner'}
          </div>
          <button onClick={handleLogout} className="text-xs bg-[var(--danger-bg)] text-[var(--danger)] px-2 py-1.5 rounded-md font-bold flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>`
  },
  {
    file: 'src/app/staff/components/StaffLayout.tsx',
    oldHeader: `<div className="md:hidden flex items-center justify-between bg-[var(--bg-header)] p-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
          <ShieldAlert className="text-[var(--primary)] w-6 h-6" />
          <span>Staff Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-primary)] ml-2">
            <Menu />
          </button>
        </div>
      </div>`,
    newHeader: `<div className="md:hidden flex items-center justify-between bg-[var(--bg-header)] p-3 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-primary)] p-1">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1 font-bold text-[var(--text-primary)]">
            <ShieldAlert className="text-[var(--primary)] w-5 h-5 hidden sm:block" />
            <span className="hidden sm:block">Staff Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-[var(--text-secondary)] max-w-[80px] truncate">
            {user?.name || 'Staff'}
          </div>
          <button onClick={handleLogout} className="text-xs bg-[var(--danger-bg)] text-[var(--danger)] px-2 py-1.5 rounded-md font-bold flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>`
  },
  {
    file: 'src/app/student/components/StudentLayout.tsx',
    oldHeader: `<div className="md:hidden flex items-center justify-between bg-[var(--bg-header)] p-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
          <ShieldAlert className="text-[var(--primary)] w-6 h-6" />
          <span>Student Portal</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-primary)]">
          <Menu />
        </button>
      </div>`,
    newHeader: `<div className="md:hidden flex items-center justify-between bg-[var(--bg-header)] p-3 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-primary)] p-1">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1 font-bold text-[var(--text-primary)]">
            <ShieldAlert className="text-[var(--primary)] w-5 h-5 hidden sm:block" />
            <span className="hidden sm:block">Student Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-[var(--text-secondary)] max-w-[80px] truncate">
            {user?.name || 'Student'}
          </div>
          <button onClick={handleLogout} className="text-xs bg-[var(--danger-bg)] text-[var(--danger)] px-2 py-1.5 rounded-md font-bold flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>`
  }
];

layouts.forEach(l => {
  let content = fs.readFileSync(l.file, 'utf8');
  // Simple replace might fail if spaces don't match, let's just do an index-based replace or regex
  // Actually, I can just replace the block between "className=\"md:hidden flex items-center justify-between" and "</div>"
  // but it's nested. It's safer to use a regex or string indexOf
  
  const startStr = '{/* Mobile Header */}';
  const endStr = '{/* Mobile Backdrop */}';
  const startIndex = content.indexOf(startStr);
  const endIndex = content.indexOf(endStr);
  
  if (startIndex !== -1 && endIndex !== -1) {
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    const newContent = before + '{/* Mobile Header */}\n      ' + l.newHeader + '\n\n      ' + after;
    fs.writeFileSync(l.file, newContent, 'utf8');
    console.log('Fixed', l.file);
  }
});

// Fix superadmin layout
const superFile = 'src/app/superadmin/layout.tsx';
let superContent = fs.readFileSync(superFile, 'utf8');
superContent = superContent.replace('className="hidden md:block text-sm text-[var(--text-secondary)]"', 'className="text-sm text-[var(--text-secondary)] max-w-[80px] truncate"');
fs.writeFileSync(superFile, superContent, 'utf8');
console.log('Fixed superadmin');
