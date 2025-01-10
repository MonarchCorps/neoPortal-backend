require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const cron = require('node-cron')
const express = require('express')
const app = express()
const connectDB = require('./config/dbConnection')
const corsOptions = require('./config/corsOptions')
const credentials = require('./middleware/credentials')
const verifyJWT = require('./middleware/verifyJWT')
const ExamProgress = require('./models/ExamProgress')
const Question = require('./models/Question')
const { autoSubmitExam } = require('./controllers/exam/submitExamController')
const { autoSubmitLiveExam } = require('./controllers/exam/liveExam/liveSubmitExamController')
const PORT = process.env.PORT || 3500

connectDB()

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use('/', require('./routes/root'));

app.use(express.json());

app.use('/auth', require('./routes/api/auth'))
app.use('/register', require('./routes/api/register'))

app.use('/fetch-questions', require('./routes/fetchQuestions'))

app.use(verifyJWT)

app.use('/upload/exam', require('./routes/uploadExam'))
app.use('/uploaded/exams', require('./routes/fetchUploadedExams'))

app.use('/edit-exam', require('./routes/editExam'))
app.use('/edit-profile', require('./routes/editProfile'))

app.use('/delete-exam', require('./routes/deleteExam'))
app.use('/delete-account', require('./routes/deleteAccount'))

app.use('/start-exam', require('./routes/exam/startExam'))
app.use('/track-progress', require('./routes/exam/trackExamProgress'))

app.use('/submit-exam', require('./routes/exam/submitExam'))
app.use('/exam-summary-single', require('./routes/exam/getSingleExamSummary'))
app.use('/exam-history', require('./routes/exam/getExamHistory'))

app.use('/login-to-live-exam', require('./routes/exam/liveExam/loginToLiveExam'))
app.use('/live-save-answer', require('./routes/exam/liveExam/liveSaveAnswer'))
app.use('/live-submit-exam', require('./routes/exam/liveExam/liveSubmitExam'))
app.use('/fetch-participants', require('./routes/exam/liveExam/fetchParticipantsInExam'))

app.use('/school-add-teacher', require('./routes/addTeacherFromSchool'))
app.use('/school-fetch-teachers', require('./routes/fetchTeachersFromSchool'))
app.use('/school-edit-teacher', require('./routes/editTeacherFromSchool'))
app.use('/school-delete-teacher', require('./routes/deleteTeacherFromSchool'))

app.use('/save-question', require('./routes/saved/saveQuestion'))
app.use('/unsave-question', require('./routes/saved/unsaveQuestion'))
app.use('/get-saved-question', require('./routes/saved/getSavedQuestion'))

mongoose.connection.once('open', () => {
    console.log('Connected to Database successfully');
    app.listen(PORT, () => {
        console.log(`Server running on PORT: ${PORT}`)
    })
})

mongoose.connection.on('error', err => {
    console.log(err)
})

const retryOperation = async (operation, retries = 30, delay = 50000) => {
    let attempts = 0;
    while (attempts < retries) {
        try {
            return await operation();
        } catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed, retrying...`);
            if (attempts >= retries) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

cron.schedule('* * * * *', async () => {
    try {
        await retryOperation(async () => {
            const now = new Date();
            const incompleteExams = await ExamProgress.find({
                isCompleted: false,
                endTime: { $lte: now },
            });
            for (const exam of incompleteExams) {
                await autoSubmitExam(exam);
            }
        });
    } catch (error) {
        console.error('Cron job error:', error);
    }
})

cron.schedule('* * * * *', async () => {
    try {
        await retryOperation(async () => {
            const now = new Date();

            const liveExams = await Question.find({
                mode: 'live',
                liveEndTime: { $lte: now },
            });

            for (const exam of liveExams) {
                await autoSubmitLiveExam(exam);
            }
        });
    } catch (error) {
        console.error('Cron job error:', error);
    }
})