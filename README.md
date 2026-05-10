# SmartStudy — AI Study Assistant
# سمارت ستدي — مساعد الدراسة بالذكاء الاصطناعي

## Project Overview | نظرة عامة على المشروع

SmartStudy is an AI-powered study assistant that transforms raw study materials into interactive learning content.  
The application uses the Llama 3 model running locally through Ollama to generate:

- Study summaries
- Key concepts tables
- Interactive quizzes

The goal of the project is to help students study more efficiently using Large Language Models (LLMs).

سمارت ستدي هو مساعد دراسة يعمل بالذكاء الاصطناعي يقوم بتحويل المحتوى الدراسي الخام إلى مواد تعليمية تفاعلية.  
يستخدم التطبيق نموذج Llama 3 الذي يعمل محليًا عبر Ollama لإنشاء:

- ملخصات دراسية
- جداول للمفاهيم الأساسية
- اختبارات تفاعلية

هدف المشروع هو مساعدة الطلاب على الدراسة بشكل أكثر فعالية باستخدام النماذج اللغوية الكبيرة (LLMs).

---

# Problem Statement | مشكلة المشروع

Students often spend a large amount of time organizing notes, extracting important concepts, and creating self-assessment quizzes.

SmartStudy automates these tasks using AI to improve the learning experience and save time.

يقضي الطلاب وقتًا طويلًا في تنظيم الملاحظات الدراسية واستخراج المفاهيم المهمة وإنشاء اختبارات للمراجعة.

يقوم SmartStudy بأتمتة هذه المهام باستخدام الذكاء الاصطناعي لتحسين تجربة التعلم وتوفير الوقت.

---

# Features | المميزات

## English

- AI-generated study summaries
- Key concepts extraction
- Interactive multiple-choice quizzes
- Modern responsive UI
- Local AI execution using Ollama
- No cloud API required
- Error handling and validation
- Structured JSON-based AI responses

## العربية

- إنشاء ملخصات دراسية بالذكاء الاصطناعي
- استخراج المفاهيم الأساسية
- اختبارات تفاعلية متعددة الخيارات
- واجهة حديثة ومتجاوبة
- تشغيل النموذج محليًا عبر Ollama
- لا يحتاج إلى API مدفوع
- معالجة الأخطاء والتحقق من البيانات
- استخدام JSON لتنظيم النتائج

---

# Technologies Used | التقنيات المستخدمة

| Technology | Purpose |
|------------|----------|
| HTML5 | Structure |
| CSS3 | Styling & Responsive Design |
| JavaScript (Vanilla JS) | Application Logic |
| Ollama | Local LLM Runtime |
| Llama 3.2 | Large Language Model |
| Fetch API | API Communication |
| JSON | Structured Output |

| التقنية | الاستخدام |
|----------|------------|
| HTML5 | بناء الواجهة |
| CSS3 | التصميم والاستجابة |
| JavaScript | منطق التطبيق |
| Ollama | تشغيل النموذج محليًا |
| Llama 3.2 | النموذج اللغوي |
| Fetch API | التواصل مع النموذج |
| JSON | تنظيم البيانات |

---

# System Architecture | هيكل النظام

The project is divided into two main parts:

## Frontend
Handles:
- User interface
- User interactions
- Rendering AI-generated results
- Quiz system

Files:
- `index.html`
- `style.css`
- `app.js`

## AI Integration Layer
Handles:
- Prompt engineering
- Communication with Ollama
- JSON parsing
- Response validation

Files:
- `api.js`

---

# LLM Integration | ربط النموذج اللغوي

SmartStudy uses:

- **Llama 3.2**
- Running locally using **Ollama**

The application sends prompts to the local Ollama server:

```bash
http://localhost:11434