const questions = [
    {
        question: "What is the most common programming language for web development?",
        answers: [
            { text: "Python", correct: false },
            { text: "JavaScript", correct: true },
            { text: "C++", correct: false },
            { text: "Java", correct: false }
        ]
    },
    {
        question: "Which HTML tag is used to define an internal style sheet?",
        answers: [
            { text: "<css>", correct: false },
            { text: "<script>", correct: false },
            { text: "<style>", correct: true },
            { text: "<link>", correct: false }
        ]
    },
    {
        question: "What does CSS stand for?",
        answers: [
            { text: "Creative Style Sheets", correct: false },
            { text: "Cascading Style Sheets", correct: true },
            { text: "Computer Style Sheets", correct: false },
            { text: "Colorful Style Sheets", correct: false }
        ]
    },
    {
        question: "Which is not a JavaScript framework/library?",
        answers: [
            { text: "React", correct: false },
            { text: "Angular", correct: false },
            { text: "Vue", correct: false },
            { text: "Laravel", correct: true }
        ]
    }
];

const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const nextButton = document.getElementById('next-btn');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart-btn');
const progressBar = document.getElementById('progress-bar');

let currentQuestionIndex = 0;
let score = 0;

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    quizContainer.classList.remove('hide');
    resultContainer.classList.add('hide');
    nextButton.classList.add('hide');
    setNextQuestion();
}

function setNextQuestion() {
    resetState();
    showQuestion(questions[currentQuestionIndex]);
    updateProgressBar();
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    nextButton.classList.add('hide');
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === "true";
    
    if (correct) {
        score++;
    }
    
    Array.from(answerButtonsElement.children).forEach(button => {
        setStatusClass(button, button.dataset.correct);
        button.disabled = true; // Disable buttons after answering
    });
    
    if (questions.length > currentQuestionIndex + 1) {
        nextButton.classList.remove('hide');
    } else {
        setTimeout(showResult, 1000); // Small delay before showing result
    }
}

function setStatusClass(element, correct) {
    clearStatusClass(element);
    if (correct) {
        element.classList.add('correct');
    } else if (element.dataset.correct !== "true" && !element.disabled) {
        // Only mark wrong if it's the one we selected and it wasn't correct
        // For simplicity, we mark all non-correct as wrong, but visual emphasis is on selected
        element.classList.add('wrong');
    }
}

function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function showResult() {
    quizContainer.classList.add('hide');
    resultContainer.classList.remove('hide');
    scoreElement.innerText = `${score} out of ${questions.length}`;
    progressBar.style.width = `100%`;
}

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    setNextQuestion();
});

restartButton.addEventListener('click', startQuiz);

// Initialize Quiz
startQuiz();
