// Background script for Smart Tab Summarizer
import { API_KEY } from './config.js';

// Initialize config
const config = { apiKey: API_KEY };

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Smart Tab Summarizer installed');
  
  // Create context menu item
  chrome.contextMenus.create({
    id: 'summarizeSelection',
    title: 'Summarize Selection',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'summarizeSelection') {
    try {
      const summary = await summarizeText(info.selectionText);
      // Send summary back to popup or show in notification
      chrome.runtime.sendMessage({ type: 'summaryResult', summary });
    } catch (error) {
      console.error('Error summarizing selection:', error);
      chrome.runtime.sendMessage({ 
        type: 'error', 
        error: error.message 
      });
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'generateContent') {
    if (!config.apiKey) {
      sendResponse({ error: 'API key not configured. Please check your config.js file.' });
      return true;
    }

    summarizeText(message.prompt, message.maxTokens, message.summaryType)
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
  
  // Handle chat messages
  if (message.type === 'chatMessage') {
    if (!config.apiKey) {
      sendResponse({ error: 'API key not configured. Please check your config.js file.' });
      return true;
    }

    handleChatMessage(message.context, message.message)
      .then(response => sendResponse({ answer: response }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

// Function to summarize text using Google's Generative AI
async function summarizeText(text, maxTokens = 800, summaryType = 'medium') {
  try {
    if (!config.apiKey) {
      throw new Error('API key not configured. Please check your config.js file.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No content to summarize');
    }

    // Adjust prompt based on summary type
    let promptInstructions;
    switch(summaryType) {
      case 'short':
        promptInstructions = 'Provide a very concise summary (max 50 words), 2-3 key points, and 1-2 important facts.';
        maxTokens = 300;
        break;
      case 'medium':
        promptInstructions = 'Provide a balanced summary (max 100 words), 3-4 key points, and 2-3 important facts.';
        maxTokens = 500;
        break;
      case 'detailed':
        promptInstructions = 'Provide a comprehensive summary (max 200 words), 4-5 key points, and 3-4 important facts.';
        maxTokens = 800;
        break;
      default:
        promptInstructions = 'Provide a balanced summary (max 100 words), 3-4 key points, and 2-3 important facts.';
        maxTokens = 500;
    }

    // Create the prompt for summarization
    const prompt = `${promptInstructions}
Your response must be in valid JSON format with exactly this structure:
{
  "summary": "your summary here",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "importantData": ["important fact 1", "important fact 2"]
}

Text to summarize:
${text}`;

    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    // Call the Gemini Pro API
    const response = await fetch(`${API_URL}?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.3,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid API response format');
    }

    try {
      // Parse the response as JSON
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      
      // Validate the response structure
      if (!result.summary || !Array.isArray(result.keyPoints) || !Array.isArray(result.importantData)) {
        throw new Error('Invalid response structure');
      }

      return result;
    } catch (parseError) {
      console.error('Error parsing API response:', parseError);
      throw new Error('Failed to parse summary results');
    }
  } catch (error) {
    console.error('Error in summarizeText:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

// Function to handle chat messages
async function handleChatMessage(context, message) {
  if (!config.apiKey) {
    throw new Error('API key not configured. Please check your config.js file.');
  }

  try {
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    const prompt = `
Context: ${context}

User Question: ${message}

Please provide a helpful and accurate response to the user's question based on the context provided. 
Keep the response concise and focused on the question.`;

    const response = await fetch(`${API_URL}?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid API response format');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
}
