const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add security headers
app.use((req, res, next) => {
    res.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https:; connect-src 'self' http://localhost:* https:; font-src 'self' https:");
    res.header('X-Content-Type-Options', 'nosniff');
    next();
});

app.use(express.static(path.join(__dirname)));

// Routes
app.get('/api/quiz', (req, res) => {
    try {
        const fs = require('fs');
        const data = fs.readFileSync('questions.json', 'utf8');
        const questions = JSON.parse(data);
        // Map 'answer' to 'correct' for compatibility
        const mappedQuestions = questions.map(q => ({
            ...q,
            correct: q.answer
        }));
        res.json({ questions: mappedQuestions });
    } catch (error) {
        console.error('Error loading questions:', error);
        res.status(500).json({ error: 'Failed to load questions' });
    }
});

app.post('/api/submit', (req, res) => {
    try {
        const { score, total } = req.body;
        console.log(`Quiz submitted - Score: ${score}/${total}`);
        res.json({ 
            success: true, 
            message: 'Quiz submitted successfully',
            score,
            total
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
