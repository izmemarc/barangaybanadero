# 🏛️ Barangay Bañadero Website

A modern, responsive website for Barangay Bañadero built with Next.js and Tailwind CSS.

## 🌟 Features

- **Modern Design** - Clean, professional layout with premium typography
- **Responsive** - Works perfectly on desktop, tablet, and mobile
- **Fast Performance** - Built with Next.js for optimal speed
- **Easy Updates** - Simple content management
- **Professional Deployment** - Automated deployment system

## 🚀 Quick Start

### **Development**
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Visit http://localhost:3000
```

### **Deployment**
Choose your deployment method:

1. **🎯 Fully Automated** (Recommended)
   - Double-click `deployment/deploy.bat`
   - Enter server details once
   - Done! Website is live

2. **📋 Manual Deployment**
   - Follow `deployment/MANUAL-DEPLOYMENT.md`
   - Step-by-step instructions

## 📁 Project Structure

```
barangay-website/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── hero-section.tsx   # Main hero section
│   ├── header.tsx         # Navigation header
│   ├── community-section.tsx # Community info
│   └── ui/               # UI components (shadcn/ui)
├── public/               # Static assets
│   ├── logo.png          # Barangay logo
│   ├── captain.png       # Captain photo
│   ├── bg.jpg           # Background image
│   └── ...              # Other images
├── deployment/           # Deployment scripts & guides
│   ├── deploy.bat        # Windows deployment
│   ├── update.bat        # Windows updates
│   ├── setup.sh          # Server setup
│   └── *.md             # Deployment guides
└── src/                 # Source images (backup)
```

## 🎨 Customization

### **Content Updates**
- **Barangay Name**: Update in `components/header.tsx` and `components/hero-section.tsx`
- **Captain Info**: Edit `components/hero-section.tsx`
- **Mission/Vision**: Modify `components/hero-section.tsx`
- **Services**: Update clearance and announcement cards
- **Images**: Replace files in `public/` folder

### **Styling**
- **Colors**: Edit Tailwind classes in components
- **Fonts**: Configure in `app/layout.tsx`
- **Layout**: Modify component structures

## 🔧 Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Fonts**: Google Fonts (Montserrat, Inter, Source Serif 4)
- **Icons**: Lucide React
- **Deployment**: Node.js + PM2 + Nginx

## 📊 Management

### **After Deployment**
```bash
# Check status
pm2 status

# View logs
pm2 logs barangay-website

# Restart if needed
pm2 restart barangay-website
```

### **Updates**
- **Automated**: Double-click `deployment/update.bat`
- **Manual**: Upload new files and run `deployment/update.sh`

## 🌐 Live Website

After deployment, your website will be accessible at:
- `http://YOUR_VULTR_IP`
- `https://your-domain.com` (after domain setup)

## 📞 Support

For issues or questions:
1. Check the deployment guides in `deployment/` folder
2. Review troubleshooting sections
3. Check server logs: `pm2 logs barangay-website`

---

**Built with ❤️ for Barangay Bañadero**
