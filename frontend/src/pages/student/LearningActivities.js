import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Layers, Shuffle, Puzzle, Headphones, Music2, Eye, Type, LayoutTemplate, Search, Lightbulb } from 'lucide-react';

const ACTIVITIES = [
  {
    id: 'flashcards',
    icon: Layers,
    title: 'Flash Cards',
    description: 'See a word, flip the card to find its meaning and hear it read aloud. Great for building word knowledge.',
    skill: 'Vocabulary',
    level: 'Easy',
    levelColor: 'bg-green-100 text-green-700',
    cardColor: 'from-blue-50/80 to-indigo-50/80 border-blue-200',
    iconColor: 'bg-indigo-100 text-indigo-600',
    btnColor: 'bg-indigo-600 hover:bg-indigo-700',
    route: '/student/activities/flashcards',
  },
  {
    id: 'scramble',
    icon: Shuffle,
    title: 'Word Scramble',
    description: 'Letters are all mixed up! Tap them in the right order to spell the word. Builds letter and spelling skills.',
    skill: 'Spelling',
    level: 'Easy',
    levelColor: 'bg-green-100 text-green-700',
    cardColor: 'from-amber-50/80 to-orange-50/80 border-amber-200',
    iconColor: 'bg-orange-100 text-orange-600',
    btnColor: 'bg-orange-500 hover:bg-orange-600',
    route: '/student/activities/scramble',
  },
  {
    id: 'match',
    icon: Puzzle,
    title: 'Word Match',
    description: 'Read the word and pick the correct meaning from 4 choices. Trains reading comprehension.',
    skill: 'Comprehension',
    level: 'Medium',
    levelColor: 'bg-amber-100 text-amber-700',
    cardColor: 'from-violet-50/80 to-purple-50/80 border-violet-200',
    iconColor: 'bg-violet-100 text-violet-600',
    btnColor: 'bg-violet-600 hover:bg-violet-700',
    route: '/student/activities/match',
  },
  {
    id: 'listen-spell',
    icon: Headphones,
    title: 'Listen & Spell',
    description: 'Hear the word spoken aloud, then pick the letters in order to spell it. Perfect for phonics practice.',
    skill: 'Phonics',
    level: 'Medium',
    levelColor: 'bg-amber-100 text-amber-700',
    cardColor: 'from-rose-50/80 to-pink-50/80 border-rose-200',
    iconColor: 'bg-rose-100 text-rose-600',
    btnColor: 'bg-rose-500 hover:bg-rose-600',
    route: '/student/activities/listen-spell',
  },
  {
    id: 'rhyme',
    icon: Music2,
    title: 'Rhyme Finder',
    description: 'Hear a word, then find which of the 4 choices rhymes with it. Trains phonological awareness.',
    skill: 'Phonological',
    level: 'Medium',
    levelColor: 'bg-amber-100 text-amber-700',
    cardColor: 'from-emerald-50/80 to-teal-50/80 border-emerald-200',
    iconColor: 'bg-emerald-100 text-emerald-600',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    route: '/student/activities/rhyme',
  },
  {
    id: 'sight-words',
    icon: Eye,
    title: 'Sight Words',
    description: 'Hear a common word, then spot the correct spelling among look-alike options. 3 difficulty levels.',
    skill: 'Reading',
    level: 'Hard',
    levelColor: 'bg-red-100 text-red-700',
    cardColor: 'from-cyan-50/80 to-sky-50/80 border-cyan-200',
    iconColor: 'bg-sky-100 text-sky-600',
    btnColor: 'bg-sky-600 hover:bg-sky-700',
    route: '/student/activities/sight-words',
  },
  {
    id: 'missing-letter',
    icon: Type,
    title: 'Missing Letter',
    description: 'A word has one letter hidden. Pick the right letter to complete it. Great for spelling practice!',
    skill: 'Spelling',
    level: 'Easy',
    levelColor: 'bg-green-100 text-green-700',
    cardColor: 'from-violet-50/80 to-indigo-50/80 border-violet-200',
    iconColor: 'bg-violet-100 text-violet-600',
    btnColor: 'bg-violet-600 hover:bg-violet-700',
    route: '/student/activities/missing-letter',
  },
  {
    id: 'sentence-builder',
    icon: LayoutTemplate,
    title: 'Sentence Builder',
    description: 'Words are shuffled — tap them in the right order to build a complete sentence.',
    skill: 'Grammar',
    level: 'Medium',
    levelColor: 'bg-amber-100 text-amber-700',
    cardColor: 'from-emerald-50/80 to-teal-50/80 border-emerald-200',
    iconColor: 'bg-emerald-100 text-emerald-600',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    route: '/student/activities/sentence-builder',
  },
  {
    id: 'odd-one-out',
    icon: Search,
    title: 'Odd One Out',
    description: "Four words appear — one doesn't belong with the others. Can you spot the odd one out?",
    skill: 'Vocabulary',
    level: 'Medium',
    levelColor: 'bg-amber-100 text-amber-700',
    cardColor: 'from-rose-50/80 to-pink-50/80 border-rose-200',
    iconColor: 'bg-rose-100 text-rose-600',
    btnColor: 'bg-rose-500 hover:bg-rose-600',
    route: '/student/activities/odd-one-out',
  },
];

const LearningActivities = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="inline-flex w-8 h-8 rounded-xl bg-brand-100 text-brand-600 items-center justify-center">
            <Lightbulb size={16} />
          </span>
          Learning Activities
        </h1>
        <p className="text-slate-500 mt-1 text-sm ml-10">
          Pick an activity and go at your own pace — each one helps you read and learn more easily.
        </p>
      </div>

      <div className="my-5 p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl text-sm text-indigo-700">
        <span className="font-bold">Tip:</span> Every activity has a <strong>Hear it</strong> button that reads words aloud for you.
        Change reading speed and language from the <strong>Accessibility</strong> button at the bottom-right corner.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACTIVITIES.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className={`rounded-2xl border bg-gradient-to-br p-6 flex flex-col gap-4 shadow-sm
                          hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer
                          ${act.cardColor}`}
              onClick={() => navigate(act.route)}
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${act.iconColor}`}>
                  <Icon size={24} />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${act.levelColor}`}>
                    {act.level}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200">
                    {act.skill}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">{act.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{act.description}</p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); navigate(act.route); }}
                className={`mt-auto w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm ${act.btnColor}`}
              >
                Start Activity →
              </button>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default LearningActivities;
