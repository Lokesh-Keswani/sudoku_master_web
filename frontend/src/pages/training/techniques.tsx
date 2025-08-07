import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { useRouter } from 'next/router';
import { BookOpen, Search, Filter, ChevronUp, Moon, Sun } from 'lucide-react';
import TechniqueCard from '../../components/TechniqueCard';
import TechniqueModal from '../../components/TechniqueModal';
import { useThemeStore } from '../../store/themeStore';
import { 
  techniques, 
  getTechniquesByDifficulty, 
  categories, 
  categoryColors,
  Technique 
} from '../../data/techniques';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

const TechniquesTrainer: React.FC = () => {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const { theme, toggleTheme } = useThemeStore();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Filter techniques based on search and category
  const getFilteredTechniques = (difficulty: typeof LEVELS[number]) => {
    let filtered = getTechniquesByDifficulty(difficulty);
    
    if (searchTerm) {
      filtered = filtered.filter(technique =>
        technique.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        technique.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        technique.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(technique => technique.category === selectedCategory);
    }
    
    return filtered;
  };

  // Auto-scroll to top when switching tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedIndex]);

  const handleLearnMore = (technique: Technique) => {
    setSelectedTechnique(technique);
    setIsModalOpen(true);
  };

  const handlePractice = (technique: Technique) => {
    // Navigate to the practice page with the technique name
    router.push(`/training/practice/${technique.id}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTechnique(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
              Techniques Trainer
            </h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Master Sudoku solving techniques from beginner to expert levels. 
            Learn, practice, and perfect your solving skills with our comprehensive technique library.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search techniques..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
                    w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    placeholder-gray-400 dark:placeholder-gray-500
                    bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                  "
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="
                  flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg
                  hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              >
                <Filter className="w-4 h-4" />
                Filter
                <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Category Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
                        ${selectedCategory === 'All' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      All Categories
                    </button>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`
                          px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
                          ${selectedCategory === category 
                            ? categoryColors[category as keyof typeof categoryColors] 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }
                        `}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tab Interface */}
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <Tab.List className="flex space-x-1 p-1">
              {LEVELS.map((level, index) => (
                <Tab
                  key={level}
                  className={({ selected }) =>
                    `flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none ${
                      selected 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className={`
                      w-2 h-2 rounded-full
                      ${index === 0 ? 'bg-green-400' : 
                        index === 1 ? 'bg-yellow-400' : 
                        index === 2 ? 'bg-orange-400' : 'bg-red-400'}
                    `} />
                    {level}
                  </div>
                </Tab>
              ))}
            </Tab.List>
          </div>

          <Tab.Panels>
            {LEVELS.map((level) => (
              <Tab.Panel key={level}>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {/* Results Count */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {level} Techniques
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getFilteredTechniques(level).length} technique{getFilteredTechniques(level).length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Techniques Grid */}
                  {getFilteredTechniques(level).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {getFilteredTechniques(level).map((technique) => (
                        <TechniqueCard
                          key={technique.id}
                          technique={technique}
                          onLearnMore={handleLearnMore}
                          onPractice={handlePractice}
                        />
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        No techniques found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-500">
                        Try adjusting your search terms or filters
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Technique Modal */}
      <TechniqueModal
        technique={selectedTechnique}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPractice={handlePractice}
      />
    </div>
  );
};

export default TechniquesTrainer; 