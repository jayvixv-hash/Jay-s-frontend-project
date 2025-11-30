// Minimal, easy-to-read quiz script
let questions = [];
let current = 0;
let answers = [];

const esc = s => s == null ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function loadQuiz() {
    try {
        const res = await fetch('/api/quiz');
        const data = await res.json();
        questions = (data && data.questions ? data.questions : []).slice(0, 15);
        answers = new Array(questions.length).fill(-1);
        document.getElementById('total').textContent = questions.length;
        document.getElementById('total2').textContent = questions.length;
        render();
    } catch (e) {
        console.error(e);
        alert('Failed to load quiz. Is the server running?');
    }
}

function render() {
    const q = questions[current];
    if (!q) return;
    document.getElementById('question').textContent = q.question;
    document.getElementById('count').textContent = current + 1;

    const opts = q.options || [];
    const html = opts.map((opt, i) => {
        const checked = answers[current] === i ? 'checked' : '';
        return `
            <div class="form-check">
                <input class="form-check-input" type="radio" name="ans" id="opt_${current}_${i}" value="${i}" ${checked}>
                <label class="form-check-label" for="opt_${current}_${i}">${esc(opt)}</label>
            </div>`;
    }).join('') || '<p class="text-danger">No options available</p>';

    document.getElementById('options').innerHTML = html;
    document.getElementById('prevBtn').disabled = current === 0;
    document.getElementById('nextBtn').style.display = current === questions.length - 1 ? 'none' : 'inline-block';
}

function save() {
    const sel = document.querySelector('input[name="ans"]:checked');
    if (sel) answers[current] = parseInt(sel.value);
}

function nextQuestion() { save(); if (current < questions.length - 1) { current++; render(); } }
function prevQuestion() { save(); if (current > 0) { current--; render(); } }

async function submitQuiz() {
    save();
    const score = answers.filter((a, i) => a === questions[i].correct).length;
    try {
        await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score, total: questions.length }) });
    } catch (e) { console.error(e); }
    document.getElementById('quizPage').style.display = 'none';
    document.getElementById('resultPage').style.display = 'block';
    document.getElementById('score').textContent = score;
}

loadQuiz();
