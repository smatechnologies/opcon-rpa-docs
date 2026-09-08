module.exports = {
  mySidebar: [
    'overview',
    'release-notes',
    {
      type: 'category',
      label: 'OpCon RPA',
      link: { type: 'doc', id: 'opcon-rpa-overview' },
      collapsed: true,
      items: [
        'system-requirements-opcon-rpa',
        'acquiring-a-license-opcon-rpa',
        'installation-opcon-rpa',
        {
          type: 'category',
          label: 'Permissions and Troubleshooting',
          link: { type: 'doc', id: 'rpa-permissions' },
          collapsed: true,
          items: [
            'rpa-unattended-session',
            'rpa-rdp-login',
            'rpa-permissions-troubleshooting',
            'troubleshooting-opcon-rpa',
          ],
        },
        'install-cloud-vpn',
        'update-opcon-rpa',
        'rpa-backup-restore',
        'mapping-opcon-properties',
        'import-export-tasks-opcon-rpa',
        {
          type: 'category',
          label: 'Task Types',
          link: { type: 'doc', id: 'task-types-overview' },
          collapsed: true,
          items: [
            'rpa-wildcard-matching',
            {
              type: 'category',
              label: 'Robot Task',
              link: { type: 'doc', id: 'robot-task-rpa' },
              items: [
                'rpa-security-settings',
              ],
            },
            {
              type: 'category',
              label: 'Web Macro',
              link: { type: 'doc', id: 'web-macro-task' },
              items: [
                'web-macro-native-clicks',
              ],
            },
            {
              type: 'category',
              label: 'Scan Document',
              link: { type: 'doc', id: 'scan-document-task' },
              items: [
                'scan-document-scan-models',
              ],
            },
          ],
        },
        'copy-task-rpa',
        'delete-task-rpa',
      ],
    },
  ],
};
