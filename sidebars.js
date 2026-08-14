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
        'rpa-permissions',
        'install-cloud-vpn',
        'update-opcon-rpa',
        'mapping-opcon-properties',
        'troubleshooting-opcon-rpa',
        {
          type: 'category',
          label: 'Robot Task',
          link: { type: 'doc', id: 'robot-task-rpa' },
          items: [
            'rpa-security-settings',
          ],
        },
        'copy-task-rpa',
        'delete-task-rpa',
      ],
    },
  ],
};
