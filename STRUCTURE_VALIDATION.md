# 🎯 ORDISS Framework Structure Validation & Recommendations

## ✅ Current Implementation Analysis

### **Your Structure (Excellent!)**
```
pages/
├── auth/
│   ├── auth-helper.js
│   └── login.page.js
├── organogram/
│   ├── node-config/
│   ├── node-context-menu.page.js
│   └── organogram-canvas.page.js
├── unit-type/
│   ├── unit-type-form.page.js
│   └── unit-type-list.page.js
├── base.page.js
└── (base-page.js in base/ folder)

role-permission/
├── permission-group-form.page.js
├── permission-group-list.page.js
└── permission-search.page.js

unit/
├── unit-form.page.js
└── unit-list.page.js

tests/
└── login.spec.js

utils/
└── csv-reader.js
```

## 📊 Validation Against ORDISS Flow

### ✅ **What's Good:**

1. **Modular Structure** ✅
   - Separate folders for each module
   - Clear separation of concerns
   - Follows domain-driven design

2. **Naming Pattern** ✅
   - `*.page.js` for page objects
   - `*.spec.js` for tests
   - Clear, descriptive names

3. **Base Page Pattern** ✅
   - You have `BasePage` class
   - Good foundation for inheritance

4. **CSV Reader** ✅
   - Utility for data-driven testing
   - Reusable across tests

### ⚠️ **Issues Found:**

1. **Duplicate Base Page**
   - `pages/base.page.js` ✅ (Good)
   - `base/base-page.js` ❌ (Duplicate)
   - `base/app-shell.page.js` (Unclear purpose)

2. **Import Path Issues**
   - `login.page.js` imports `'./base.page'` but should be `'../base.page'`

3. **Missing Files**
   - Many page files are empty or not created yet

4. **Inconsistent Location**
   - `role-permission/` folder at root level
   - Should be `pages/role-permission/` for consistency

## 🎯 Recommended Structure (Aligned with ORDISS Flow)

```
ordiss-playwright-framework/
├── pages/
│   ├── base.page.js                          ✅ Keep this
│   │
│   ├── auth/
│   │   ├── login.page.js                     ✅ Exists
│   │   └── auth-helper.js                    ✅ Exists
│   │
│   ├── unit-type/
│   │   ├── unit-type-list.page.js            ✅ Exists
│   │   ├── unit-type-form.page.js            ⚠️  Fix imports
│   │   └── unit-type-detail.page.js          ➕ Add (for view/edit)
│   │
│   ├── organogram/
│   │   ├── organogram-canvas.page.js         ✅ Exists (empty)
│   │   ├── organogram-node.page.js           ➕ Add (for node operations)
│   │   ├── node-context-menu.page.js         ✅ Exists (empty)
│   │   └── node-config/
│   │       ├── manpower-config.page.js       ➕ Add (TO&E)
│   │       ├── permission-config.page.js     ➕ Add (Configure permissions)
│   │       └── store-items-config.page.js    ➕ Add (Configure Store Items)
│   │
│   ├── unit/
│   │   ├── unit-list.page.js                 ➕ Move from root
│   │   ├── unit-form.page.js                 ➕ Move from root
│   │   └── unit-detail.page.js               ➕ Add
│   │
│   └── role-permission/
│       ├── permission-group-list.page.js     ➕ Move from root
│       ├── permission-group-form.page.js     ➕ Move from root
│       ├── permission-search.page.js         ➕ Move from root
│       ├── permission-assignment.page.js     ➕ Add (assign to groups)
│       └── role-list.page.js                 ➕ Add (for future)
│
├── tests/
│   ├── login.spec.js                         ✅ Exists
│   ├── unit-type.spec.js                     ➕ Add
│   ├── organogram.spec.js                    ➕ Add
│   ├── unit.spec.js                          ➕ Add
│   ├── permission-group.spec.js              ➕ Add
│   └── e2e/
│       └── complete-flow.spec.js             ➕ Add (full flow test)
│
├── utils/
│   ├── csv-reader.js                         ✅ Exists
│   ├── excel-helper.js                       ➕ Add (for Excel support)
│   ├── test-data-helper.js                   ➕ Add (data management)
│   └── screenshot-helper.js                  ➕ Add (for debugging)
│
├── test-data/
│   ├── unit-types.csv                        ✅ Exists
│   ├── unit-types.xlsx                       ➕ Add (your Excel file)
│   ├── organogram-nodes.csv                  ➕ Add
│   ├── units.csv                             ➕ Add
│   └── permission-groups.csv                 ➕ Add
│
├── config/
│   └── test-config.js                        ✅ Exists
│
└── playwright.config.js                      ✅ Exists
```

## 🔧 Immediate Actions Needed

### 1. **Fix Import Paths**

**File: `pages/auth/login.page.js`**
```javascript
// ❌ Current (Wrong)
const BasePage = require('./base.page');

// ✅ Should be
const BasePage = require('../base.page');
```

### 2. **Move Files to Correct Locations**

```bash
# Move role-permission folder
mv role-permission/* pages/role-permission/
rmdir role-permission

# Move unit folder
mv unit/* pages/unit/
rmdir unit

# Remove duplicate base folder
rm -rf base/
```

### 3. **Remove Duplicate Base Page**

Keep only `pages/base.page.js` and remove `base/base-page.js`

### 4. **Fix unit-type-form.page.js**

This file currently has test code. It should only have page object code:

```javascript
// pages/unit-type/unit-type-form.page.js
const BasePage = require('../base.page');

class UnitTypeFormPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors
    this.nameEnglishInput = '#nameEnglish';
    this.nameBanglaInput = '#nameBangla';
    this.shortNameEnglishInput = '#shortNameEnglish';
    this.shortNameBanglaInput = '#shortNameBangla';
    this.categorySelect = '#category';
    this.serviceSelect = '#service';
    this.typeSelect = '#type';
    this.isDepotCheckbox = '#isDepot';
    this.isWorkshopCheckbox = '#isWorkshop';
    this.corpsInput = '#corps';
    this.saveButton = 'button:has-text("Save")';
    this.cancelButton = 'button:has-text("Cancel")';
  }

  async fillForm(data) {
    await this.fill(this.nameEnglishInput, data['Name (English)']);
    await this.fill(this.nameBanglaInput, data['Name (Bangla)']);
    await this.fill(this.shortNameEnglishInput, data['Short Name (English)']);
    await this.fill(this.shortNameBanglaInput, data['Short Name (Bangla)']);
    
    // Dropdowns
    await this.page.selectOption(this.categorySelect, data['Category']);
    await this.page.selectOption(this.serviceSelect, data['Service']);
    await this.page.selectOption(this.typeSelect, data['Type']);
    
    // Checkboxes
    if (data['Is Depot'] === 'Yes') {
      await this.page.check(this.isDepotCheckbox);
    }
    if (data['Is Workshop'] === 'Yes') {
      await this.page.check(this.isWorkshopCheckbox);
    }
    
    await this.fill(this.corpsInput, data['Corps Names (English)']);
  }

  async save() {
    await this.click(this.saveButton);
    await this.waitForLoad();
  }

  async cancel() {
    await this.click(this.cancelButton);
  }
}

module.exports = UnitTypeFormPage;
```

## 📋 Page Objects Needed for ORDISS Flow

### **Priority 1: Core Flow**

1. **Unit Type Module** ✅ (Partially done)
   - `unit-type-list.page.js` - List and search
   - `unit-type-form.page.js` - Create/Edit form
   - `unit-type-detail.page.js` - View details

2. **Organogram Module** ⚠️ (Needs implementation)
   - `organogram-canvas.page.js` - Canvas interactions
   - `organogram-node.page.js` - Node operations
   - `node-context-menu.page.js` - Context menu actions
   - `node-config/manpower-config.page.js` - TO&E configuration
   - `node-config/permission-config.page.js` - Permission configuration

3. **Unit Module** ⚠️ (Needs to be moved)
   - `unit-list.page.js` - List units
   - `unit-form.page.js` - Create/Edit unit
   - `unit-detail.page.js` - View unit details

4. **Permission Group Module** ⚠️ (Needs to be moved)
   - `permission-group-list.page.js` - List groups
   - `permission-group-form.page.js` - Create/Edit group
   - `permission-assignment.page.js` - Assign permissions
   - `permission-search.page.js` - Search permissions

### **Priority 2: Shared Components**

5. **Shared Component** (Important!)
   - `pages/shared/permission-panel.page.js` - Reusable permission panel
     - Used in: Organogram > Node > Configure permissions
     - Used in: Role & Permissions > Permission Group

## 🎯 Naming Conventions (Your Pattern is Good!)

### **Page Objects:**
```
✅ {module}-{action}.page.js
   - unit-type-form.page.js
   - unit-type-list.page.js
   - organogram-canvas.page.js
   - permission-group-form.page.js
```

### **Test Files:**
```
✅ {module}.spec.js
   - login.spec.js
   - unit-type.spec.js
   - organogram.spec.js
```

### **Utilities:**
```
✅ {purpose}-{type}.js
   - csv-reader.js
   - excel-helper.js
   - test-data-helper.js
```

## 🔄 ORDISS Flow Implementation Checklist

### **Flow: Login → Unit Type → Organogram → Unit → Permissions**

```javascript
// tests/e2e/complete-flow.spec.js
test('Complete ORDISS Flow', async ({ page }) => {
  // 1. Login
  const loginPage = new LoginPage(page);
  await loginPage.login('main.superadmin', 'Ordiss@SA');
  
  // 2. Create Unit Type
  const unitTypeForm = new UnitTypeFormPage(page);
  await unitTypeForm.fillForm(testData.unitType);
  await unitTypeForm.save();
  
  // 3. Setup Organogram
  const organogramCanvas = new OrganogramCanvasPage(page);
  await organogramCanvas.selectUnitType(testData.unitType.name);
  
  // 3a. Create child nodes
  await organogramCanvas.createChildNode('HQ Division');
  await organogramCanvas.createChildNode('Operations Wing');
  
  // 3b. Configure node permissions
  const nodeContextMenu = new NodeContextMenuPage(page);
  await nodeContextMenu.openContextMenu('HQ Division');
  await nodeContextMenu.selectOption('Configure permissions');
  
  const permissionConfig = new PermissionConfigPage(page);
  await permissionConfig.assignPermissions(['CREATE', 'READ', 'UPDATE']);
  
  // 3c. Configure TO&E (Manpower)
  await nodeContextMenu.selectOption('TO&E (Manpower)');
  const manpowerConfig = new ManpowerConfigPage(page);
  await manpowerConfig.setManpower({ officers: 10, soldiers: 50 });
  
  // 4. Create Unit
  const unitForm = new UnitFormPage(page);
  await unitForm.selectUnitType(testData.unitType.name);
  await unitForm.fillForm(testData.unit);
  await unitForm.save();
  
  // 5. Create Permission Group
  const permissionGroupForm = new PermissionGroupFormPage(page);
  await permissionGroupForm.fillForm(testData.permissionGroup);
  await permissionGroupForm.assignPermissions(['CREATE_UNIT', 'EDIT_UNIT']);
  await permissionGroupForm.save();
});
```

## 🎨 Shared Component Pattern

### **Permission Panel (Used in 2 places)**

```javascript
// pages/shared/permission-panel.page.js
class PermissionPanelPage extends BasePage {
  constructor(page, context) {
    super(page);
    this.context = context; // 'permission-group' or 'organogram-node'
  }

  async getTitle() {
    // If from permission group: shows group name
    // If from organogram: shows hierarchy
    return await this.page.textContent('.panel-title');
  }

  async searchPermissions(query) {
    await this.fill('#permission-search', query);
  }

  async selectPermission(permissionName) {
    await this.click(`input[value="${permissionName}"]`);
  }

  async assignFromGroup(groupName) {
    await this.click(`button:has-text("${groupName}")`);
  }

  async save() {
    await this.click('button:has-text("Save")');
  }
}

module.exports = PermissionPanelPage;
```

### **Usage:**

```javascript
// From Permission Group
const permissionPanel = new PermissionPanelPage(page, 'permission-group');
const title = await permissionPanel.getTitle(); // Shows: "Admin Group"

// From Organogram Node
const permissionPanel = new PermissionPanelPage(page, 'organogram-node');
const title = await permissionPanel.getTitle(); // Shows: "HQ > Division > Wing"
```

## 📝 Summary of Changes Needed

### **Immediate (Critical):**
1. ✅ Fix import path in `login.page.js`
2. ✅ Move `role-permission/` to `pages/role-permission/`
3. ✅ Move `unit/` to `pages/unit/`
4. ✅ Remove `base/` folder (duplicate)
5. ✅ Fix `unit-type-form.page.js` (remove test code)

### **Short-term (Important):**
6. ➕ Implement organogram page objects
7. ➕ Create shared permission panel component
8. ➕ Add Excel helper utility
9. ➕ Create complete flow test

### **Long-term (Enhancement):**
10. ➕ Add role management pages (when implemented)
11. ➕ Add store items configuration (when implemented)
12. ➕ Add receive items configuration (when implemented)

---

**🎯 Your structure is excellent! Just need to fix paths and move folders for consistency.**