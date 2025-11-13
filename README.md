pages/
├── auth/
│   ├── login.page.js
│   └── auth-helper.js          # handles tokens, session, SSO if needed
├── unit-type/
│   ├── unit-type-list.page.js  # main grid/list
│   └── unit-type-form.page.js  # create/edit modal/form
├── organogram/
│   ├── organogram-canvas.page.js   # main canvas + zoom/pan
│   ├── node-context-menu.page.js   # reusable context menu actions
│   └── node-config/
│       ├── manpower.page.js        # TO&E
│       └── permission-group-panel.page.js  ← reused in Roles!
├── unit/
│   ├── unit-list.page.js
│   └── unit-form.page.js
├── role-permission/
│   ├── permission-group-list.page.js
│   ├── permission-group-form.page.js   # create/edit
│   └── permission-search.page.js       # shared search component
└── base/
    ├── base-page.js
    └── app-shell.page.js       # header/sidebar nav, global actions