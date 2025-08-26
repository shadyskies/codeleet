# 🚀 LeetCode Company-wise Interview Questions

A comprehensive web application that displays LeetCode interview questions organized by company. Browse through hundreds of companies and explore their frequently asked interview questions with an interactive, sortable interface.

## ✨ Features

### 🏢 Company Directory
- **685+ Companies**: Browse through a comprehensive list of tech companies
- **Smart Search**: Real-time search functionality to quickly find companies
- **Company Stats**: View question counts and company information
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 📊 Interactive Question Tables
- **Sortable Columns**: Click on any column header to sort questions
- **Advanced Filtering**: Filter by difficulty level (Easy/Medium/Hard)
- **Real-time Search**: Search through question titles and IDs
- **Question Statistics**: View breakdown by difficulty levels
- **Direct LeetCode Links**: Click to open problems directly on LeetCode

### 🎨 Modern UI/UX
- **Beautiful Design**: Clean, modern interface with smooth animations
- **Dark/Light Themes**: Automatically adapts to user preferences
- **Mobile Responsive**: Optimized for all screen sizes
- **Fast Loading**: Efficient data loading and rendering


## 📱 How to Use

1. **Browse Companies**: Start at the home page to see all available companies
2. **Search**: Use the search bar to quickly find specific companies
3. **View Questions**: Click on any company to see their interview questions
4. **Sort & Filter**: Use the controls to organize questions by difficulty, acceptance rate, etc.
5. **Access LeetCode**: Click on question titles or "View Problem" to open on LeetCode

## 🛠️ Technical Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Modern CSS with Flexbox/Grid, animations, and responsive design
- **Data**: CSV files containing LeetCode question data
- **Hosting**: GitHub Pages (static hosting)

## 🏗️ Project Structure

```
├── index.html          # Main page - company directory
├── company.html        # Company questions page
├── styles.css          # All styling and responsive design
├── script.js           # Main page functionality
├── company.js          # Company page functionality  
├── company_list.txt    # List of all companies
├── data/              # CSV files for each company
│   ├── amazon.csv
│   ├── google.csv
│   ├── microsoft.csv
│   └── ...
└── README.md          # This file
```

## 🚀 Hosting on GitHub Pages

### Method 1: Direct Repository Hosting

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit - LeetCode Company Questions"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click on "Settings" tab
   - Scroll down to "Pages" section
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Access Your Site**:
   - Your site will be available at: `https://yourusername.github.io/repository-name`
   - It may take a few minutes to deploy

### Method 2: Custom Domain (Optional)

1. **Add CNAME file**:
   ```bash
   echo "yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push origin main
   ```

2. **Configure DNS**: Point your domain to GitHub Pages IPs

## 💻 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/repository-name.git
   cd repository-name
   ```

2. **Serve locally** (choose one method):
   
   **Using Python**:
   ```bash
   python -m http.server 8000
   ```
   
   **Using Node.js**:
   ```bash
   npx serve .
   ```
   
   **Using PHP**:
   ```bash
   php -S localhost:8000
   ```

3. **Open browser**: Navigate to `http://localhost:8000`

## 📊 Data Format

Each company's CSV file follows this structure:
```csv
ID,URL,Title,Difficulty,Acceptance %,Frequency %
1,https://leetcode.com/problems/two-sum,Two Sum,Easy,55.9%,100.0%
2,https://leetcode.com/problems/add-two-numbers,Add Two Numbers,Medium,46.4%,75.0%
```

## 🔧 Customization

### Adding New Companies
1. Add the company name to `company_list.txt`
2. Create a corresponding CSV file in the `data/` folder
3. The site will automatically detect and display the new company

### Styling Changes
- Modify `styles.css` for visual customizations
- The CSS uses CSS custom properties for easy theme changes
- All responsive breakpoints are defined for mobile optimization

### Functionality Enhancements
- `script.js`: Main page functionality (search, filtering, navigation)
- `company.js`: Company page functionality (table sorting, filtering, export)

## 🌟 Features Included

### Interactive Elements
- ✅ Real-time search across companies and questions
- ✅ Sortable table columns (ID, Title, Difficulty, Acceptance, Frequency)
- ✅ Difficulty-based filtering
- ✅ Responsive design for all devices
- ✅ Smooth animations and transitions
- ✅ Direct LeetCode integration
- ✅ Export functionality for filtered results

### Performance Optimizations
- ✅ Debounced search input
- ✅ Efficient CSV parsing
- ✅ Lazy loading capabilities
- ✅ Minimal dependencies (pure JavaScript)

## 🎯 Keyboard Shortcuts

- **Ctrl/Cmd + K**: Focus search input
- **Escape**: Clear search
- **Enter**: Navigate to first search result (company page)

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Site**: [Your GitHub Pages URL]
- **Repository**: [Your GitHub Repository URL]
- **LeetCode**: [https://leetcode.com](https://leetcode.com)

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the browser console for error messages
- Ensure all CSV files are properly formatted

---

**Happy Coding! 🎉** 

Built with ❤️ for the coding interview preparation community.