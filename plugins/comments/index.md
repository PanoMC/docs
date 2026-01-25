# Comments Plugin

The **Comments** plugin enables a robust discussion system for your blog posts, pages, and other platform content. It features a modern interface with deep integration into the Pano user system.

## ⚙️ Configuration

Admins can fine-tune the discussion experience from the backend:

### 💬 Interaction Features
- **Replies Enabled:** Toggle whether users can reply to existing comments.
- **Likes Enabled:** allow users to "like" comments and replies.
- **Cooldown:** Set a mandatory wait time (in seconds) between consecutive comments to prevent spam.

### 🔒 Permissions
- **Comment Permission:** Assign a specific node required to post comments.
- **Reply Permission:** Assign a specific node required to reply to comments.
*(Leave empty to allow all registered users.)*

### 🎨 Display & Interface
- **Input Style:** Choose between `MODAL` (pop-up editor) or `INLINE` (embedded form).
- **Pagination Type:** Select `PAGINATION` (numbered pages) or `LOAD MORE` for a modern scroll experience.

## 🛡️ Moderation & Management

Maintain a healthy community with built-in moderation tools accessible via the **Pano Admin Panel**:

- **Universal Management:** Navigate to **Panel → Posts → Comments** to view and manage all comments and replies across the platform.
- **Post-Specific Comments:** View and moderate comments directly within the **Panel → Posts → Post Detail** page of any specific post.
- **Highlighting & Sharing:** You can copy a specific comment's link to highlight it for other authorized moderators, making it easier to point out specific discussions that need attention.
- **User Integration:** See exactly who posted what with direct links to player profiles and avatars.
- **Cleanup:** Quickly delete inappropriate content directly from the management tables.

## 🛡️ Required Permission
To moderate and manage comments, users must have the following permission:
`pano.plugin.pano-plugin-comments.manage.comments`

## 🔧 Setup & Configuration
1. Enable the plugin in the **Pano Admin Panel**.
2. **Configure Settings:** Navigate to **Panel → Addons → Comments** to adjust your settings (e.g., enabling likes, setting permissions, or cooldowns).
3. **Start Moderating:** Visit **Panel → Posts → Comments** to manage your community's discussions.
