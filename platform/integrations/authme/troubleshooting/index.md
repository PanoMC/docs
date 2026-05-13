# AuthMe Troubleshooting & Help

## Security & Compatibility

### Password Security

Pano uses AuthMe's **CUSTOM hash** type, which allows Pano to validate passwords securely without storing plaintext passwords or using weak hashing algorithms.

### Backup System

Before modifying any AuthMe configuration, Pano **automatically creates a backup** of your `config.yml` file. You can find backups in:

```
plugins/Pano/authme-backup.yml
```

If something goes wrong, you can always restore your previous configuration.

### Plugin Conflicts

Some AuthMe addons or related plugins may conflict with Pano's integration, especially if they:

- Modify the same configuration values
- Hook into the same AuthMe events
- Change password hashing methods

If you experience issues, try disabling conflicting plugins one by one to identify the cause.
## Troubleshooting

### Integration Not Working

**Symptoms:** Players can't register or login, commands don't work

**Solutions:**
1. Make sure AuthMeReloaded is installed and running (check `/plugins`)
2. Verify the Pano MC Plugin is connected to Pano (check Panel → Server Status)
3. Ensure the integration checkbox is enabled in Panel → Server Settings → Game Integration
4. Restart your Minecraft server after enabling the integration
5. Check server logs for any errors

### Configuration Keeps Resetting

**Symptoms:** AuthMe config values change back after restart

**Solutions:**
1. Do not manually edit `passwordHash` or `registration.type` in AuthMe's config
2. Let Pano manage these settings automatically
3. If you need to change other AuthMe settings, edit them through AuthMe's config and reload

### Commands Not Responding

**Symptoms:** `/register` or `/login` commands don't work

**Solutions:**
1. Check if the integration is enabled in the panel
2. Verify the player is connected to the correct server
3. Make sure you're using the exact command syntax (no aliases)
4. Check if another plugin is overriding the commands
## Reporting Issues

If you encounter bugs, missing features, or compatibility issues with AuthMeReloaded integration:

- **GitHub Issues:** [PanoMC/pano-mc-plugin](https://github.com/PanoMC/pano-mc-plugin/issues)
- **Discord:** [Join our community](https://discord.gg/6vVy72wgXT)

When reporting an issue, please include:
- Your Pano version
- Your AuthMeReloaded version
- Your Minecraft server version (Spigot/Paper/Folia)
- Server logs showing the error
- Steps to reproduce the issue

> Together, we make Pano better.
## Related Documentation

- [Game Integrations](../)
- [Installing Pano](../../installation/)
- [Configuration Guide](../../configuration/)
- [FAQ](../../FAQ/)
- [Advanced Topics](../../advanced/)
