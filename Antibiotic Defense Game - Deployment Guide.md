# Antibiotic Defense Game - Deployment Guide

This guide provides instructions for deploying the Antibiotic Defense educational game. The game is built with Phaser 3 and can be deployed as a static website.

## Prerequisites

- Basic understanding of HTML, JavaScript, and web servers
- A web server or static web hosting service
- Git (optional for version control)

## Project Files

The project has the following structure:

```
antibiotics-game/
├── index.html             # Main HTML entry point
├── css/
│   └── styles.css         # Basic styling
├── assets/                # (Optional) Game assets if not generated programmatically
├── js/
│   ├── main.js            # Game initialization
│   ├── scenes/            # Game scenes
│   ├── entities/          # Game entity classes
│   └── data/              # Game data (pathogens and antibiotics)
└── lib/
    └── phaser.min.js      # Phaser library
```

## Setup Instructions

### 1. Download Phaser

Download the latest version of Phaser from the official website (https://phaser.io/download) or use a CDN.

For local deployment:
1. Download `phaser.min.js`
2. Place it in the `lib/` directory

For CDN (modify `index.html`):
```html
<script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>
```

### 2. Test Locally

To test the game locally:

1. Use a local web server. There are several options:
   - Use Python's built-in HTTP server:
     ```
     # Python 3
     python -m http.server
     
     # Python 2
     python -m SimpleHTTPServer
     ```
   - Use Node.js and http-server:
     ```
     npm install -g http-server
     http-server
     ```
   - Use VS Code's Live Server extension

2. Open your browser and navigate to `http://localhost:8000` (or the port shown in your terminal)

### 3. Deployment Options

#### Option 1: GitHub Pages (Free)

1. Create a new GitHub repository
2. Push your code to the repository
3. Go to repository settings → GitHub Pages
4. Choose the branch to deploy (usually `main` or `master`)
5. Your game will be available at `https://yourusername.github.io/your-repo-name/`

#### Option 2: Netlify (Free Tier)

1. Create an account on Netlify
2. Connect your GitHub repository or upload the files directly
3. Configure deployment settings (usually automatic)
4. Your game will be available at a Netlify subdomain with option to use a custom domain

#### Option 3: Vercel (Free Tier)

1. Create an account on Vercel
2. Connect your GitHub repository
3. Configure deployment settings
4. Your game will be available at a Vercel subdomain with option to use a custom domain

#### Option 4: AWS S3 + CloudFront (Low Cost)

1. Create an S3 bucket configured for static website hosting
2. Upload all files to the bucket
3. (Optional) Set up CloudFront CDN for better performance
4. Configure your domain to point to the S3 bucket or CloudFront distribution

## Production Optimizations

For a smoother gameplay experience, consider these optimizations:

1. **Minify JavaScript files**: Use tools like UglifyJS or Webpack to minify your JavaScript
   ```
   npm install -g uglify-js
   uglifyjs js/main.js -o js/main.min.js
   ```

2. **Optimize images**: If you use image assets, compress them using tools like TinyPNG or ImageOptim

3. **Bundle files**: Consider bundling your JavaScript files for fewer HTTP requests
   ```
   uglifyjs js/data/*.js js/entities/*.js js/scenes/*.js js/main.js -o js/game.min.js
   ```

4. **Add cache headers**: Configure your web server to set appropriate cache headers for static assets

## Mobile Considerations

The game is designed to be responsive, but for a better mobile experience:

1. Test on various devices and screen sizes
2. Consider adding touch controls for mobile users
3. Add a "Fullscreen" button for a more immersive mobile experience
4. Test performance on lower-end devices and optimize if necessary

## Troubleshooting

- **Assets not loading**: Check file paths, ensure they're relative to the index.html file
- **Game not starting**: Check the browser console for JavaScript errors
- **Performance issues**: Reduce the number of particles, reduce the game size, or optimize game loop

## Educational Integration

For educational contexts:

1. Consider adding a simple backend to track student progress (optional)
2. Create accompanying worksheets or discussion questions
3. Add a feedback mechanism for students to report issues or suggest improvements

## Maintaining the Game

To keep the game up-to-date:

1. Periodically update Phaser to the latest version
2. Update antibiotic and pathogen data when medical guidelines change
3. Consider adding new features based on educator and student feedback

## License and Attribution

Ensure you have appropriate licenses for all assets and libraries used in your game. Consider adding attribution for:

- Phaser library
- Any educational resources or data referenced
- Contributors to the project

## Further Assistance

For additional help with deployment or technical issues, consult:

- Phaser documentation: https://phaser.io/docs
- GitHub Pages documentation: https://docs.github.com/en/pages
- Netlify documentation: https://docs.netlify.com
- Vercel documentation: https://vercel.com/docs
