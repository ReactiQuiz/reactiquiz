# Ads Setup Guide for ReactiQuiz

## 🎯 Quick Start

### 1. Google AdSense (Recommended)

#### **Step 1: Apply for AdSense**
1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Click "Get Started"
3. Add your website: `https://reactiquiz.web.app`
4. Fill out the application form
5. Wait for approval (1-14 days)

#### **Step 2: Get Your Ad Codes**
1. After approval, go to AdSense dashboard
2. Click "Ads" → "By ad unit"
3. Create ad units for different placements:
   - **Top Banner**: 728x90 Leaderboard
   - **Sidebar**: 300x250 Medium Rectangle
   - **Inline**: 728x90 Leaderboard
   - **Mobile**: 320x50 Mobile Banner

#### **Step 3: Update Configuration**
1. Open `src/config/ads.ts`
2. Replace `YOUR-PUBLISHER-ID` with your AdSense client ID
3. Replace slot IDs with your actual ad unit IDs
4. Set `ENABLED: true`

#### **Step 4: Deploy**
```bash
npm run build
npm run firebase:deploy
```

### 2. Alternative Ad Networks

#### **Media.net (Yahoo/Bing)**
- **Requirements**: 10,000+ monthly page views
- **Revenue**: Good for educational content
- **Setup**: Similar to AdSense

#### **PropellerAds**
- **Requirements**: Lower traffic requirements
- **Revenue**: Good for international traffic
- **Setup**: Easy integration

#### **Ezoic**
- **Requirements**: 10,000+ monthly sessions
- **Revenue**: AI-optimized ad placement
- **Setup**: More complex but higher revenue

## 📊 Revenue Optimization Tips

### **High Revenue Pages**
1. **Quiz Pages**: Users spend more time here
2. **Results Pages**: High engagement
3. **Home Page**: High traffic
4. **Subject Pages**: Targeted content

### **Ad Placement Best Practices**
1. **Above the fold**: Top of page
2. **Between content**: Natural breaks
3. **Sidebar**: Non-intrusive
4. **Mobile-friendly**: Responsive ads

### **Performance Optimization**
1. **Lazy loading**: Load ads only when visible
2. **Ad blocking detection**: Show alternative content
3. **A/B testing**: Test different placements
4. **Analytics**: Track ad performance

## 🚀 Implementation

### **Current Ad Placements**
- ✅ Home page: Inline banner
- ✅ Quiz pages: Between questions
- ✅ Results pages: Top banner
- ✅ Sidebar: Throughout the app

### **Revenue Potential**
- **Low traffic** (1K-10K views/month): $10-50/month
- **Medium traffic** (10K-100K views/month): $50-500/month
- **High traffic** (100K+ views/month): $500+/month

## 📱 Mobile Optimization

### **Responsive Ads**
- Use responsive ad units
- Test on different screen sizes
- Optimize for mobile users

### **Mobile-Specific Placements**
- Top banner: 320x50
- Inline: 300x250
- Bottom banner: 320x50

## 🔧 Troubleshooting

### **Common Issues**
1. **Ads not showing**: Check ad blocker
2. **Low revenue**: Optimize placement
3. **Approval denied**: Improve content quality
4. **Slow loading**: Use lazy loading

### **Ad Blocker Detection**
The app automatically detects ad blockers and shows alternative content.

## 📈 Analytics

### **Track Performance**
1. **AdSense dashboard**: Revenue and impressions
2. **Google Analytics**: User behavior
3. **Custom metrics**: Ad engagement

### **Key Metrics**
- **RPM**: Revenue per thousand impressions
- **CTR**: Click-through rate
- **Fill rate**: Percentage of ad requests filled

## 💡 Pro Tips

1. **Content is King**: Quality content = higher ad revenue
2. **User Experience**: Don't sacrifice UX for ads
3. **A/B Testing**: Test different ad placements
4. **Mobile First**: Optimize for mobile users
5. **Regular Updates**: Keep ad placements fresh

## 🎯 Next Steps

1. **Apply for AdSense** (if not already done)
2. **Update configuration** with your ad IDs
3. **Deploy changes** to production
4. **Monitor performance** and optimize
5. **Scale up** with more ad placements

---

**Remember**: Ad revenue depends on traffic, content quality, and user engagement. Focus on growing your user base first! 🚀
