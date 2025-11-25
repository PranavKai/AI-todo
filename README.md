# AI-Powered Todo App

A modern, feature-rich todo application with AI-powered analytics, drag-and-drop functionality, and beautiful animations.

## Features

### Core Functionality
- **Beautiful UI** - Modern glassmorphism design with smooth animations
- **Drag & Drop** - Intuitive task reordering with @dnd-kit
- **Smooth Animations** - Powered by Framer Motion
- **Three-Column Layout** - Todo, In Progress, and Done columns
- **Task Management** - Create, edit, delete, and reorder tasks
- **Priority Levels** - Low, Medium, and High priority tags
- **Rich Descriptions** - Add detailed descriptions to tasks

### AI-Powered Analytics
- **Pattern Detection** - AI identifies your task patterns
- **Completion Insights** - Understand what tasks you complete
- **Failure Analysis** - AI analyzes why tasks aren't completed
- **Smart Recommendations** - Get personalized productivity tips
- **Free LLM Integration** - Uses Groq API with Llama 3.3 70B

### Analytics Dashboard
- **Visual Charts** - Beautiful charts showing task trends
- **Completion Rates** - Track your productivity over time
- **Weekly Stats** - See your progress over the past 7 days
- **Real-time Metrics** - Live updates of your task statistics

## Tech Stack

### Backend
- **Node.js** + **Express** - REST API
- **TypeScript** - Type-safe development
- **Better-SQLite3** - Fast, embedded database
- **Groq API** - Free LLM for AI analysis (Llama 3.3 70B)

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **@dnd-kit** - Drag and drop functionality
- **Recharts** - Beautiful data visualization
- **Lucide React** - Icon library

## Setup Instructions

### Prerequisites
- Node.js 18+ (or Bun runtime)
- npm, yarn, pnpm, or bun package manager

### 1. Get a Free Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you'll need it in step 3)

The free tier is generous and perfect for this app!

### 2. Install Dependencies

#### Backend
```bash
cd server
npm install
# or
bun install
```

#### Frontend
```bash
cd client
npm install
# or
bun install
```

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```env
PORT=3001
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run the Application

#### Start Backend (Terminal 1)
```bash
cd server
npm run dev
# or
bun run dev
```

The server will start at `http://localhost:3001`

#### Start Frontend (Terminal 2)
```bash
cd client
npm run dev
# or
bun run dev
```

The app will open at `http://localhost:5173`

## Usage Guide

### Creating Tasks
1. Click "Add New Task" button
2. Fill in the task details (title, description, priority, status)
3. Click "Create Task"

### Managing Tasks
- **Edit**: Click the edit icon on any task
- **Delete**: Click the trash icon
- **Move**: Drag tasks between columns or reorder within columns
- **Change Status**: Use the dropdown to move between Todo/In Progress/Done
- **Change Priority**: Use the priority dropdown

### Viewing Analytics
1. Click the "Analytics" tab
2. View your task statistics and charts
3. See completion rates and trends over time

### AI Insights
1. Click the "AI Insights" tab
2. Click "Refresh" to generate new insights
3. Review patterns, completion insights, blockers, and recommendations
4. The AI analyzes your task history to provide personalized tips

## Project Structure

```
todo-app/
├── server/
│   ├── src/
│   │   ├── database.ts      # SQLite database schema & queries
│   │   ├── ai-service.ts    # AI analysis with Groq/Llama
│   │   └── index.ts         # Express API server
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskItem.tsx      # Draggable task card
│   │   │   ├── TaskForm.tsx      # Task creation form
│   │   │   ├── Analytics.tsx     # Analytics dashboard
│   │   │   └── AIInsights.tsx    # AI insights display
│   │   ├── App.tsx          # Main application
│   │   ├── api.ts           # API client
│   │   ├── types.ts         # TypeScript types
│   │   └── index.css        # Global styles
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `PATCH /api/tasks/reorder` - Reorder tasks
- `DELETE /api/tasks/:id` - Delete a task

### Analytics
- `GET /api/analytics/daily` - Get daily statistics
- `GET /api/analytics/weekly` - Get weekly statistics

### AI
- `GET /api/ai/analyze` - Generate AI insights
- `GET /api/ai/insights` - Get recent insights

## Features in Detail

### Drag and Drop
- Reorder tasks within columns
- Move tasks between status columns
- Smooth animations during drag
- Automatic position saving

### AI Analysis
The AI analyzes:
- Task creation patterns
- Priority distribution
- Completion rates
- Task types and categories
- Productivity trends
- Blockers and obstacles

And provides:
- Pattern insights
- Completion analysis
- Failure reasons
- Actionable recommendations

### Animations
- Smooth page transitions
- Task card animations
- Loading states
- Hover effects
- Drag animations

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme.

### AI Model
Change the model in `server/src/ai-service.ts`:
```typescript
model: 'llama-3.3-70b-versatile', // Try other Groq models
```

### Database
The SQLite database is stored at `server/todo.db`. Delete it to start fresh.

## Troubleshooting

### Backend won't start
- Check that port 3001 is not in use
- Verify Node.js version is 18+
- Run `npm install` in the server directory

### Frontend won't connect to backend
- Ensure backend is running on port 3001
- Check Vite proxy settings in `vite.config.ts`

### AI insights not working
- Verify your GROQ_API_KEY in `.env`
- Check API key is valid at console.groq.com
- Check backend logs for errors

### Tasks not persisting
- Check `server/todo.db` file exists
- Verify database permissions
- Check backend logs for SQL errors

## License

MIT

## Contributing

Feel free to open issues or submit pull requests!

## Credits

Built with modern web technologies and powered by AI.
