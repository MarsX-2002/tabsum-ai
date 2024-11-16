document.addEventListener('DOMContentLoaded', async () => {
  // Initialize UI elements
  const summarizeBtn = document.getElementById('summarizeBtn');
  const summaryContent = document.getElementById('summaryContent');
  const keyPoints = document.getElementById('keyPoints');
  const importantData = document.getElementById('importantData');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const errorContainer = document.getElementById('errorContainer');
  const summaryLength = document.getElementById('summaryLength');
  const themeToggle = document.getElementById('themeToggle');
  const saveBtn = document.getElementById('saveBtn');

  let currentSummary = '';
  let pageContent = '';

  // Initialize UI
  function initializeUI() {
    loadTheme();
    setupEventListeners();
  }

  initializeUI();

  // Theme handling
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Load saved theme or use system preference
  chrome.storage.local.get(['theme'], function(result) {
    const savedTheme = result.theme || (prefersDark.matches ? 'dark' : 'light');
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  });

  // Theme toggle handler
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    chrome.storage.local.set({ theme: newTheme });
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  // Summarize button handler
  if (summarizeBtn) {
    summarizeBtn.addEventListener('click', async () => {
      try {
        // Reset UI state
        setLoading(true);
        updateStatus('Analyzing page content...', 'info');
        summaryContent.style.display = 'none';
        toggleError(false);

        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
          throw new Error('No active tab found');
        }

        // Extract page content
        const result = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractPageContent
        });

        if (!result || !result[0] || !result[0].result) {
          throw new Error('Failed to extract page content');
        }

        const content = result[0].result;
        
        // Get summary length preference
        const length = summaryLength.value || 'medium';

        // Send content to background script for summarization
        chrome.runtime.sendMessage(
          { 
            type: 'generateContent',
            prompt: content,
            maxTokens: length === 'short' ? 300 : length === 'medium' ? 500 : 800,
            summaryType: length
          },
          (response) => {
            setLoading(false);
            
            if (response.error) {
              toggleError(true, response.error);
              updateStatus('Failed to generate summary', 'error');
              return;
            }

            try {
              if (!response.summary || typeof response.summary !== 'string') {
                throw new Error('Invalid summary format');
              }

              const summaryData = {
                summary: response.summary,
                keyPoints: response.keyPoints || [],
                importantData: response.importantData || []
              };

              displaySummary(summaryData);
              updateStatus('Summary generated successfully!', 'success');
              enableActions();
              
              // Store for chat context
              currentSummary = response.summary;
              pageContent = content;
            } catch (err) {
              console.error('Summary parsing error:', err);
              toggleError(true, 'Failed to parse summary results. Please try again.');
              updateStatus('Failed to display summary', 'error');
            }
          }
        );
      } catch (error) {
        setLoading(false);
        console.error('Summarization error:', error);
        toggleError(true, error.message);
        updateStatus('Failed to generate summary', 'error');
      }
    });
  }

  // Helper function to extract page content
  function extractPageContent() {
    try {
      // Get main content using common selectors
      const selectors = [
        'article',
        'main',
        '[role="main"]',
        '.main-content',
        '#main-content',
        '.post-content',
        '.article-content',
        '.content'
      ];

      let content = null;
      
      // Try each selector until we find content
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText.trim().length > 100) {
          content = element;
          break;
        }
      }

      // Fallback to body if no suitable content found
      if (!content) {
        content = document.body;
      }

      // Remove unwanted elements
      const unwantedSelectors = [
        'script',
        'style',
        'nav',
        'header',
        'footer',
        'iframe',
        'noscript',
        '.nav',
        '.header',
        '.footer',
        '.sidebar',
        '.ad',
        '.advertisement',
        '.social-share',
        '.comments'
      ];

      const elementsToRemove = content.querySelectorAll(unwantedSelectors.join(','));
      elementsToRemove.forEach(el => el.remove());

      // Get text content and clean it up
      let text = content.innerText
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();

      // Limit text length to avoid API limits
      const maxLength = 10000;
      if (text.length > maxLength) {
        text = text.substring(0, maxLength) + '...';
      }

      return text;
    } catch (error) {
      console.error('Error extracting content:', error);
      throw new Error('Failed to extract page content');
    }
  }

  function setLoading(isLoading) {
    if (loadingSpinner) {
      loadingSpinner.style.display = isLoading ? 'flex' : 'none';
    }
    if (summarizeBtn) {
      summarizeBtn.disabled = isLoading;
    }
  }

  function displaySummary(summary) {
    if (summaryContent && keyPoints && importantData) {
      // Display summary
      const summaryText = document.getElementById('summaryText');
      if (summaryText) {
        summaryText.textContent = summary.summary;
      }

      // Display key points
      keyPoints.innerHTML = '';
      if (summary.keyPoints) {
        summary.keyPoints.forEach(point => {
          const li = document.createElement('li');
          li.textContent = point;
          keyPoints.appendChild(li);
        });
      }

      // Display important data
      importantData.innerHTML = '';
      if (summary.importantData) {
        summary.importantData.forEach(data => {
          const li = document.createElement('li');
          li.textContent = data;
          importantData.appendChild(li);
        });
      }

      // Show the summary content
      summaryContent.style.display = 'block';
    }
  }

  function updateStatus(message, type = 'info') {
    const status = document.getElementById('status');
    const statusMessage = document.getElementById('statusMessage');
    if (status && statusMessage) {
      status.className = `status-container ${type}`;
      statusMessage.textContent = message;
    }
  }

  function toggleError(show, message = '') {
    if (errorContainer) {
      errorContainer.style.display = show ? 'block' : 'none';
      if (show) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
          errorMessage.textContent = message;
        }
      }
    }
  }

  function enableActions() {
    if (saveBtn) saveBtn.disabled = false;
  }

  function setupEventListeners() {
    // Copy button functionality
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const textToCopy = generateCopyText();
        try {
          await navigator.clipboard.writeText(textToCopy);
          showToast('Summary copied to clipboard!');
        } catch (err) {
          showToast('Failed to copy text', 'error');
        }
      });
    }

    // Share functionality
    const shareOptions = document.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = option.getAttribute('data-platform');
        const text = encodeURIComponent(generateCopyText());
        
        let shareUrl = '';
        switch (platform) {
          case 'whatsapp':
            shareUrl = `https://wa.me/?text=${text}`;
            break;
          case 'telegram':
            shareUrl = `https://t.me/share/url?url=&text=${text}`;
            break;
          case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${text}`;
            break;
          case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${text}`;
            break;
          case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?text=${text}`;
            break;
          case 'email':
            shareUrl = `mailto:?subject=Check out this summary&body=${text}`;
            break;
        }
        
        if (shareUrl) {
          window.open(shareUrl, '_blank', 'noopener,noreferrer');
          showToast('Opening share dialog...');
        }
      });
    });
  }

  function generateCopyText() {
    const summaryText = document.getElementById('summaryText');
    const keyPointsList = document.getElementById('keyPoints');
    const importantDataList = document.getElementById('importantData');
    
    let text = '';
    
    // Add summary
    if (summaryText) {
      text += summaryText.textContent + '\n\n';
    }
    
    // Add key points
    if (keyPointsList && keyPointsList.children.length > 0) {
      text += 'Key Points:\n';
      Array.from(keyPointsList.children).forEach(point => {
        text += `* ${point.textContent}\n`;
      });
      text += '\n';
    }
    
    // Add important data
    if (importantDataList && importantDataList.children.length > 0) {
      text += 'Important Data:\n';
      Array.from(importantDataList.children).forEach(data => {
        text += `* ${data.textContent}\n`;
      });
      text += '\n';
    }
    
    // Add extension link
    text += '\n---\nSummarized with TabSum AI - Your Intelligent Web Content Summarizer\n';
    text += 'Try it: https://chrome.google.com/webstore/detail/tabsum-ai/[extension-id]';
    
    return text.trim();
  }

  function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (toast && toastMessage) {
      toast.className = `toast ${type}`;
      toastMessage.textContent = message;
      toast.style.display = 'block';
      
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3000);
    }
  }

  function loadTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    chrome.storage.local.get(['theme'], function(result) {
      const savedTheme = result.theme || (prefersDark.matches ? 'dark' : 'light');
      document.body.setAttribute('data-theme', savedTheme);
      updateThemeIcon(savedTheme);
    });
  }
});
