import React, { useState, useEffect } from 'react';
import { Lock, Check, Star, ArrowLeft, BookOpen, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { useTheme } from '@/contexts/ThemeContext';

interface Level {
  id: number;
  status: 'locked' | 'current' | 'completed';
  stars: number;
  topicTitle: string;
  explanation: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  };
}

interface Chapter {
  id: number;
  name: string;
  subject: string;
  levels: Level[];
}

interface Subject {
  id: string;
  name: string;
  emoji: string;
  chapters: Chapter[];
}

// --- Data Generation ---

const SUBJECT_DATA = [
  { name: 'Biology', emoji: '🧬' },
  { name: 'Mathematics', emoji: '📐' },
  { name: 'History', emoji: '🏛️' },
  { name: 'Science', emoji: '🔬' },
  { name: 'English', emoji: '✍️' },
];

function generateInitialSubjects(): Subject[] {
  const SUBJECT_TOPICS: Record<string, Array<{ title: string; explanation: string; correct: string; distractors: string[] }>> = {
    Biology: [
      { title: 'Photosynthesis — How plants make food', explanation: 'Plants convert sunlight into energy using chloroplasts. They store energy as sugars and support growth and life.', correct: 'Using sunlight in chloroplasts to make sugars', distractors: ['Breathing oxygen to make energy', 'Absorbing food from soil directly', 'Storing water in roots'] },
      { title: 'Chlorophyll — Green energy helper', explanation: 'Chlorophyll is the green pigment in leaves that captures light and helps convert it into chemical energy during photosynthesis.', correct: 'Pigment that captures light for photosynthesis', distractors: ['A root that stores nutrients', 'A hormone for growth', 'A gas released by plants'] },
      { title: 'Light vs Dark Reactions', explanation: 'Photosynthesis has light reactions that capture energy and dark reactions that build sugars. Both occur inside chloroplasts.', correct: 'Light reactions capture energy; dark reactions build sugars', distractors: ['Dark reactions occur only at night', 'Light reactions make DNA', 'They are the same step'] },
      { title: 'Cell Structure — Basic parts', explanation: 'Cells have membranes, a nucleus, and organelles that perform jobs. Each part helps the cell survive and work.', correct: 'Different organelles perform specific jobs in a cell', distractors: ['Cells are empty sacs', 'All cells are identical', 'Cells do not contain DNA'] },
      { title: 'Mitosis — Cell division', explanation: 'Mitosis creates two identical daughter cells for growth and repair, following ordered steps to copy and separate chromosomes.', correct: 'A process producing two identical daughter cells', distractors: ['Creates reproductive cells', 'Digests old cell parts', 'Produces energy'] },
      { title: 'Meiosis — Making gametes', explanation: 'Meiosis makes eggs and sperm with half the DNA, mixing genes so offspring inherit traits from both parents.', correct: 'Cell division that makes gametes with half DNA', distractors: ['Cell repair process', 'Type of photosynthesis', 'Digestion step'] },
      { title: 'DNA — The genetic code', explanation: 'DNA stores instructions for building and running organisms. Its sequence of bases determines traits passed between generations.', correct: 'Molecule that stores genetic information', distractors: ['A protein used for energy', 'A type of cell membrane', 'A sugar molecule'] },
      { title: 'Mitochondria — Powerhouses', explanation: 'Mitochondria produce usable energy by breaking down food molecules; they are vital for active tissues like muscles.', correct: 'Organelles that produce energy for the cell', distractors: ['Storage for water', 'Part of cell wall', 'A DNA factory'] },
      { title: 'Ribosomes — Protein makers', explanation: 'Ribosomes read genetic instructions and build proteins which do most jobs inside cells.', correct: 'Structures that make proteins in the cell', distractors: ['Store fats', 'Move the cell', 'Are pigments'] },
      { title: 'Cell Membrane — Gatekeeper', explanation: 'The membrane controls what enters and leaves the cell, keeping conditions inside stable and allowing communication.', correct: 'Boundary that controls transport in and out of the cell', distractors: ['Rigid wall', 'Genetic material', 'Food storage'] },
      { title: 'Osmosis & Diffusion', explanation: 'Diffusion spreads particles from high to low concentration; osmosis is water moving across a membrane to balance concentrations.', correct: 'Movement from high to low concentration; osmosis is water across membranes', distractors: ['Require energy input', 'Only in plants', 'Create new particles'] },
      { title: 'Enzymes — Biological helpers', explanation: 'Enzymes speed up chemical reactions in living things without being consumed; they are specific to reactions they help.', correct: 'Proteins that speed up biological reactions', distractors: ['Simple sugars', 'Types of membranes', 'Waste products'] },
      { title: 'Cellular Respiration', explanation: 'Cells break down food with oxygen to release energy inside mitochondria; this powers activities like movement.', correct: 'Breaking down food with oxygen to release energy', distractors: ['Making food from sunlight', 'Cell division process', 'Storing genetic info'] },
      { title: 'Ecosystems — Communities', explanation: 'Ecosystems are communities of organisms and their environment interacting, with energy flow and nutrient cycles.', correct: 'Communities of organisms and their environment interacting', distractors: ['Only forests', 'Places where cells live', 'A single species'] },
      { title: 'Food Chains', explanation: 'Food chains show energy flow from producers to consumers and help explain relationships between species.', correct: 'Sequence showing energy flow from producers to consumers', distractors: ['List of plants', 'Web of cell parts', 'Type of photosynthesis'] },
      { title: 'Producers vs Consumers', explanation: 'Producers make their own food (like plants); consumers eat other organisms. This explains roles in ecosystems.', correct: 'Producers make food; consumers eat producers or other consumers', distractors: ['Producers are animals', 'Consumers make food', 'They are the same'] },
      { title: 'Biodiversity', explanation: 'Biodiversity is the variety of life in an area; higher biodiversity helps ecosystems be stronger and adapt to change.', correct: 'Variety of species in an ecosystem', distractors: ['Only the number of trees', 'A type of food chain', 'A genetic disease'] },
      { title: 'Adaptation', explanation: 'Adaptations are traits that help organisms survive in a habitat; they can be physical, behavioral, or physiological.', correct: 'Traits that help an organism survive in its environment', distractors: ['Diseases that harm species', 'Short-term behaviors', 'Random movements'] },
      { title: 'Natural Selection', explanation: 'Natural selection favors traits that help survival and reproduction, causing populations to change over generations.', correct: 'Process where beneficial traits become more common over generations', distractors: ['A choice by animals', 'Single organism change', 'Only human breeding'] },
      { title: 'Genetics Basics', explanation: 'Genetics studies how traits pass from parents to offspring using genes which are sections of DNA.', correct: 'Study of inheritance through genes', distractors: ['Weather patterns', 'Cell energy production', 'A food process'] },
      { title: 'Mutation', explanation: 'Mutations are changes in DNA that can be neutral, harmful, or helpful and create variation for evolution.', correct: 'A change in DNA sequence that can affect traits', distractors: ['Type of cell division', 'Loss of chromosomes', 'A digestive enzyme'] },
      { title: 'Immune System Basics', explanation: 'The immune system defends the body using barriers and cells that recognize and fight germs and remember past infections.', correct: 'Body defenses that detect and fight infections', distractors: ['A digestion system', 'Only in plants', 'A nervous signal'] },
      { title: 'Homeostasis', explanation: 'Homeostasis keeps internal conditions stable (like temperature) using sensors and responses to maintain balance.', correct: 'Keeping internal conditions stable for proper function', distractors: ['Growing larger', 'Making food', 'A type of cell'] },
      { title: 'Hormones', explanation: 'Hormones are chemical messengers carried in blood that control growth, metabolism, and mood.', correct: 'Chemical signals that control functions in the body', distractors: ['Structures for energy', 'Proteins for structure', 'Parts of nervous system'] },
      { title: 'Nervous System', explanation: 'The nervous system sends fast electrical signals for sensing and moving and includes the brain and nerves.', correct: 'System that sends electrical signals for control and sensing', distractors: ['A set of hormones', 'Only the heart', 'A food chain'] },
      { title: 'Evolution Evidence', explanation: 'Fossils, DNA, and anatomy provide evidence that species have changed over time and help trace life’s history.', correct: 'Fossils, DNA, and anatomy showing species change over time', distractors: ['Only stories', 'Proof species never change', 'Photosynthesis facts'] },
      { title: 'DNA vs RNA', explanation: 'DNA stores long-term genetic information while RNA helps use that information to build proteins.', correct: 'DNA stores info; RNA helps build proteins from it', distractors: ['They are identical', 'RNA stores long-term info', 'Both are sugars'] },
      { title: 'Genetic Variation', explanation: 'Variation comes from mutations and mixing genes during reproduction and helps populations adapt to change.', correct: 'Differences in genes among individuals from mutation and mixing', distractors: ['All individuals identical', 'Only environment', 'A disease'] },
      { title: 'Symbiosis', explanation: 'Symbiosis describes close relationships between species that can help or harm, like pollinators and flowers.', correct: 'Close relationships between species that can help or harm', distractors: ['Only predator-prey', 'A respiration type', 'A food process'] },
    ],
    Mathematics: [
      { title: 'Place Value — Understanding digits', explanation: 'Place value shows the value of a digit depending on its position and helps read and compare numbers.', correct: 'Value of a digit determined by its position', distractors: ['Color of numbers', 'Size on paper', 'How many times you add'] },
      { title: 'Addition Strategies', explanation: 'Adding can use regrouping or breaking numbers apart; choosing strategies makes solving easier and faster.', correct: 'Methods like regrouping and breaking apart to add numbers', distractors: ['Ways to color numbers', 'Only calculators', 'A type of geometry'] },
      { title: 'Subtraction with Borrowing', explanation: 'Borrowing lets you subtract when a digit is too small by taking from the next place value, keeping place values correct.', correct: 'Taking from the next place value to subtract larger digits', distractors: ['Adding extra digits', 'Multiplying digits', 'A way to divide'] },
      { title: 'Multiplication Basics', explanation: 'Multiplication is repeated addition and helps solve grouping problems quickly.', correct: 'Repeated addition of equal groups', distractors: ['Adding different numbers', 'Splitting numbers', 'A measurement unit'] },
      { title: 'Division Concepts', explanation: 'Division shares items into equal parts or groups and introduces remainders when things don’t divide evenly.', correct: 'Splitting into equal groups or sharing', distractors: ['Combining numbers', 'A type of exponent', 'A geometry rule'] },
      { title: 'Fractions — Parts of a whole', explanation: 'Fractions use a numerator and denominator to show parts of a whole and are useful for sharing and measuring.', correct: 'Number representing part of a whole using numerator/denominator', distractors: ['Always less than 1', 'A multiplication method', 'Only for money'] },
      { title: 'Equivalent Fractions', explanation: 'Different fraction pairs can represent the same value by scaling numerator and denominator, which helps with simplifying.', correct: 'Different fractions that represent the same amount', distractors: ['Fractions adding to one', 'Only same numerator', 'Always simpler'] },
      { title: 'Decimals — Parts in base 10', explanation: 'Decimals write parts of a whole using tenths and hundredths and are useful for precise measurements and money.', correct: 'Numbers using tenths/hundredths to show parts of a whole', distractors: ['Only whole numbers', 'A geometry label', 'A type of fraction'] },
      { title: 'Percentages — Parts per hundred', explanation: 'Percents show parts out of 100 and help compare ratios quickly, useful for discounts and stats.', correct: 'A way to express parts per hundred', distractors: ['Only test scores', 'A unit of length', 'A fraction type'] },
      { title: 'Factors & Multiples', explanation: 'Factors divide evenly into a number; multiples are repeated products of a number and help with LCM/GCF.', correct: 'Factors divide evenly; multiples are repeated products', distractors: ['They are the same', 'Only used in geometry', 'A decimal type'] },
      { title: 'Prime Numbers', explanation: 'Prime numbers have exactly two factors: 1 and the number itself. They are the building blocks of integers.', correct: 'Numbers with only 1 and itself as factors', distractors: ['Always even', 'Divisible by many', 'Only number 1'] },
      { title: 'Order of Operations', explanation: 'Follow parentheses, exponents, multiplication/division, then addition/subtraction to keep results consistent when solving expressions.', correct: 'Perform operations in a standard order (PEMDAS)', distractors: ['Left to right always', 'Always add first', 'Only for decimals'] },
      { title: 'Basic Algebra', explanation: 'Algebra uses symbols to represent unknowns and helps solve equations that model problems.', correct: 'Using symbols to represent unknown numbers in equations', distractors: ['Only calculus', 'A way to draw shapes', 'A list of numbers'] },
      { title: 'Patterns & Sequences', explanation: 'Patterns repeat or change by rules; sequences follow patterns and help predict next terms.', correct: 'Numbers or shapes that follow a predictable rule', distractors: ['Random lists', 'Only geometry', 'A fraction'] },
      { title: 'Measurement Units', explanation: 'Units like meters and liters measure length and volume; picking correct units is key in solving problems.', correct: 'Standard ways to measure length, volume, and mass', distractors: ['Only used in science', 'A type of graph', 'A calculation method'] },
      { title: 'Perimeter & Area', explanation: 'Perimeter measures the edge length; area measures the space inside a shape; formulas differ by shape.', correct: 'Perimeter is edge length; area is space inside a shape', distractors: ['They are the same', 'Area always larger', 'Only for circles'] },
      { title: 'Volume Basics', explanation: 'Volume measures space a 3D object occupies; boxes use length×width×height to calculate volume.', correct: 'Amount of space inside a 3D shape', distractors: ['Surface color', 'Only flat shapes', 'A fraction'] },
      { title: 'Graphs & Data', explanation: 'Graphs visualize data to compare and spot patterns; choosing the right chart makes insights clearer.', correct: 'Visual ways to show and compare data', distractors: ['Pictures without meaning', 'Only complex equations', 'A fraction'] },
      { title: 'Probability Basics', explanation: 'Probability measures how likely events are, often shown from 0 to 1 or 0% to 100%.', correct: 'Measure of how likely an event is to happen', distractors: ['Always 0.5', 'Only for money', 'A geometry rule'] },
      { title: 'Rounding Numbers', explanation: 'Rounding simplifies numbers to a nearby value by keeping a chosen place value; useful when exactness is not needed.', correct: 'Approximating a number to a nearby place value', distractors: ['Changing to fraction', 'Always larger', 'Only decimals'] },
      { title: 'Negative Numbers', explanation: 'Negative numbers are values below zero used in temperatures and debts; operations follow special rules.', correct: 'Numbers less than zero used in contexts like temperature', distractors: ['Numbers above zero', 'Only fractions', 'A shape'] },
      { title: 'Geometry Terms', explanation: 'Points, lines, angles, and shapes form geometry vocabulary needed to describe and solve problems about figures.', correct: 'Words like points, lines, and angles that describe shapes', distractors: ['Only area formulas', 'A type of algebra', 'A list of numbers'] },
      { title: 'Angles & Measures', explanation: 'Angles are measured in degrees and can be acute, right, obtuse, or straight. They appear in many shape problems.', correct: 'Different angle types measured in degrees', distractors: ['Angles measure length', 'Only used in statistics', 'Always 90°'] },
      { title: 'Symmetry Basics', explanation: 'Symmetry means halves mirror each other and appears often in nature and design.', correct: 'When two halves of an object mirror each other', distractors: ['A way to measure angles', 'A fraction', 'Only in bacteria'] },
      { title: 'Estimating', explanation: 'Estimating gives a quick approximate answer using rounding and mental math to check or speed decisions.', correct: 'Quick approximate calculation to check or speed work', distractors: ['Exact calculation only', 'A graph type', 'Always more accurate'] },
      { title: 'Number Line Use', explanation: 'Number lines show order and spacing of numbers and help visualize addition and subtraction.', correct: 'Visual line showing numbers in order for operations', distractors: ['Only for measuring length', 'Table of contents', 'A fraction'] },
    ],
    History: [
      { title: 'Ancient Civilizations', explanation: 'Early societies like Mesopotamia grew near rivers and invented writing, laws, and trade systems that shaped later cultures.', correct: 'Early organized societies with writing and trade', distractors: ['Only modern countries', 'A type of plant', 'A natural disaster'] },
      { title: 'Egypt — Pharaohs & Pyramids', explanation: 'Ancient Egypt had powerful rulers and built pyramids as tombs, reflecting beliefs and engineering skill.', correct: 'Civilization known for pharaohs, pyramids, and river farming', distractors: ['Modern city', 'A type of animal', 'A farming tool'] },
      { title: 'Greece — City-states', explanation: 'Greece featured city-states like Athens and Sparta with distinct governments; Greek ideas influenced democracy and philosophy.', correct: 'Region of city-states with early democracy and philosophy', distractors: ['Single empire', 'A type of math', 'A landmark'] },
      { title: 'Rome — Roads & Law', explanation: 'Rome built roads, laws, and structures that connected its empire and influenced modern systems.', correct: 'Empire known for engineering, law, and roads', distractors: ['Only a myth', 'A farming method', 'A language'] },
      { title: 'Middle Ages', explanation: 'The Middle Ages saw castles, knights, and growing towns with trade and crafts shaping life in Europe.', correct: 'Period with castles, feudal systems, and growing towns', distractors: ['Single short event', 'Modern factories', 'Science experiment'] },
      { title: 'Age of Exploration', explanation: 'Explorers sailed to new lands, changing trade and contact and sometimes causing conflict and colonization.', correct: 'Period when sailors explored new lands changing contact and trade', distractors: ['Local festival', 'Farming technique', 'Music type'] },
      { title: 'Industrial Revolution', explanation: 'New machines and factories changed how goods were made and where people lived, shifting work from farms to cities.', correct: 'Shift to machines and factories that changed work and cities', distractors: ['Cooking changes', 'About computers', 'Clothing type'] },
      { title: 'World Wars — Causes', explanation: 'World Wars involved many nations and complex causes like alliances; they reshaped borders, technology, and societies.', correct: 'Large conflicts with deep causes like alliances and competition', distractors: ['Small battle', 'Natural disaster', 'Only trade'] },
      { title: 'Cold War', explanation: 'The Cold War was political tension between superpowers involving rivalry in ideas, space, and arms without direct full-scale war.', correct: 'Long political rivalry between superpowers without direct full-scale war', distractors: ['Short local conflict', 'Trade agreement', 'Music type'] },
      { title: 'Civil Rights Movements', explanation: 'Movements used protests and laws to change unfair systems and expand rights for groups over time.', correct: 'Movements that fought for equal rights using protest and legal change', distractors: ['Only about voting machines', 'A school class', 'Historical novel'] },
      { title: 'Ancient Technology', explanation: 'Early tools and irrigation improved food supply and construction, helping societies grow.', correct: 'Tools and methods that improved early life and production', distractors: ['Only digital computers', 'A story', 'Weather event'] },
      { title: 'Trade & Economy', explanation: 'Trade connects regions, spreads goods and ideas, and supports specialization and growth.', correct: 'Exchange of goods and ideas that supports economies', distractors: ['Only bartering', 'Single market stall', 'A food type'] },
      { title: 'Empires Rise & Fall', explanation: 'Empires expand and collapse due to political, economic, and military pressures which shape history.', correct: 'Empires expand and collapse due to many pressures', distractors: ['Only natural disasters', 'Plant growth', 'Math formula'] },
      { title: 'Government Types', explanation: 'Governments vary from monarchies to democracies and shape how societies make decisions.', correct: 'Systems like monarchy, democracy, and republic', distractors: ['One universal system', 'Religious ritual', 'Math concept'] },
      { title: 'Historical Sources', explanation: 'Letters, artifacts, and buildings are sources that historians use to learn about the past.', correct: 'Documents and objects used as evidence to study the past', distractors: ['Modern fiction only', 'Scientific test', 'Music score'] },
      { title: 'Migration', explanation: 'People move for safety, work, or climate; migration shapes culture, language, and technology exchange.', correct: 'Movement of people that changes societies', distractors: ['Only animals', 'Weather type', 'Plant growth'] },
      { title: 'Inventions & Impact', explanation: 'Inventions like the printing press changed how ideas spread and often accelerated social change.', correct: 'New tools or methods that change daily life and society', distractors: ['Only art styles', 'Food crop', 'Person’s hobby'] },
      { title: 'Rights & Responsibilities', explanation: 'Citizens have rights and duties that support fair participation in community life.', correct: 'Legal and social rights paired with duties', distractors: ['Only school rules', 'Cooking technique', 'Scientific law'] },
      { title: 'Timelines', explanation: 'Timelines place events in order to show cause and effect over time, helping organize history.', correct: 'Ordered lists of events showing when things happened', distractors: ['Only lists of names', 'Math graph', 'Recipe'] },
      { title: 'Primary vs Secondary Sources', explanation: 'Primary sources are original materials from the time; secondary sources interpret them and provide context.', correct: 'Primary are original materials; secondary interpret them', distractors: ['They are the same', 'Only online', 'A kind of map'] },
      { title: 'Cultural Exchange', explanation: 'Cultural exchange spreads ideas, foods, and traditions between regions through trade and contact.', correct: 'Sharing of ideas and customs between different cultures', distractors: ['Only about money', 'A plant type', 'Math rule'] },
      { title: 'Revolutions', explanation: 'Revolutions are large, rapid political changes often driven by inequality and new ideas, reshaping societies.', correct: 'Fast, large-scale changes in government driven by social forces', distractors: ['Weather change', 'Scientific discovery', 'Personal decision'] },
      { title: 'Exploration Consequences', explanation: 'Exploration brought new contacts and knowledge but also conflict and colonization that reshaped cultures.', correct: 'Both new contacts and difficult consequences like colonization', distractors: ['Only positive trade', 'Food recipe', 'Only maps'] },
    ],
    Science: [
      { title: 'Scientific Method', explanation: 'The scientific method asks questions, forms hypotheses, tests with experiments, and draws conclusions to learn reliably.', correct: 'Process of asking, testing, and concluding to learn reliably', distractors: ['Guessing without tests', 'Only in history', 'A math problem'] },
      { title: 'States of Matter', explanation: 'Matter can be solid, liquid, gas or plasma; heating or cooling changes states by altering particle energy.', correct: 'Solid, liquid, gas determined by particle arrangement', distractors: ['Only solid and liquid exist', 'Type of organism', 'Chemical name'] },
      { title: 'Forces', explanation: 'Forces like gravity and friction change motion; understanding forces explains why objects move or stop.', correct: 'Pushes or pulls that change motion', distractors: ['Only feelings', 'Plant type', 'Color measure'] },
      { title: 'Energy Types', explanation: 'Energy can be kinetic, potential, thermal and more; it changes form but is conserved in closed systems.', correct: 'Different forms like kinetic and potential energy', distractors: ['Only in batteries', 'Type of mass', 'Color measurement'] },
      { title: 'Simple Machines', explanation: 'Levers, pulleys and inclined planes help do work by changing force or direction and make tasks easier.', correct: 'Tools like levers that make work easier', distractors: ['Only electrical devices', 'Machines that never move', 'Plant type'] },
      { title: 'Waves', explanation: 'Waves transfer energy; sound needs a medium while light can travel through space and both have wavelength and frequency.', correct: 'Energy transfer patterns like sound and light', distractors: ['Only in ocean', 'Type of number', 'Color name'] },
      { title: 'Electricity Basics', explanation: 'Electricity is the flow of electrons that powers devices; circuits and safety are key ideas.', correct: 'Flow of electrons through a conductor', distractors: ['Flow of water only', 'Type of magnet', 'Sound wave'] },
      { title: 'Magnetism', explanation: 'Magnets attract or repel using poles and fields which can affect certain metals and create forces at a distance.', correct: 'Attraction or repulsion due to magnetic poles', distractors: ['Only a battery', 'Chemical reaction', 'Light source'] },
      { title: 'Atoms & Molecules', explanation: 'Atoms are tiny building blocks that bond to form molecules; different bonds create different substances.', correct: 'Atoms combine into molecules to make substances', distractors: ['Visible with eye', 'Machine type', 'Geological layer'] },
      { title: 'Mixtures vs Compounds', explanation: 'Mixtures combine substances physically; compounds form when elements chemically bond and have distinct properties.', correct: 'Mixtures are physical mixes; compounds are chemically bonded', distractors: ['Always the same', 'Only liquids', 'Type of energy'] },
      { title: 'Chemical Reactions', explanation: 'Reactions rearrange atoms to form new substances; reactants change into products often with energy change.', correct: 'Process where substances change into new ones by rearranging bonds', distractors: ['Only mixing', 'Type of motion', 'Number rule'] },
      { title: 'Acids & Bases', explanation: 'Acids donate hydrogen ions and taste sour; bases accept ions and can feel slippery; pH measures acidity.', correct: 'Substances that donate (acid) or accept (base) hydrogen ions', distractors: ['Only a color code', 'Unit of weight', 'Plant type'] },
      { title: 'Density', explanation: 'Density compares mass to volume and explains why some objects float while others sink.', correct: 'Mass per unit volume showing compactness', distractors: ['Only weight', 'Type of temperature', 'Length measure'] },
      { title: 'Solutions & Solubility', explanation: 'Solutions dissolve substances evenly; solubility shows how much can dissolve and often depends on temperature.', correct: 'Uniform mixtures where solute dissolves in solvent', distractors: ['Only solids', 'Type of energy', 'Unit of time'] },
      { title: 'Chemical Energy in Life', explanation: 'Living things use chemical energy from food to power cells and perform work like movement and growth.', correct: 'Energy stored in molecules used by organisms', distractors: ['Only sunlight', 'Energy in rocks', 'A sound'] },
      { title: 'Human Body Systems', explanation: 'Systems like circulatory and respiratory work together to keep the body functioning and healthy.', correct: 'Organ systems performing tasks like breathing and circulation', distractors: ['Only single cells', 'Machine type', 'Weather system'] },
      { title: 'Gravity', explanation: 'Gravity pulls masses together and gives weight to objects; it controls falling and orbits.', correct: 'Force that attracts masses toward each other', distractors: ['Only on Earth', 'Magnet type', 'Chemical reaction'] },
      { title: 'Light Behavior', explanation: 'Light travels in straight paths, reflects and refracts, and can produce colors when split.', correct: 'Light can reflect, refract, and form colors', distractors: ['Only sound', 'Solid object', 'Chemical'] },
      { title: 'Heat Transfer', explanation: 'Heat moves by conduction, convection, or radiation and changes temperatures in materials and systems.', correct: 'Movement of thermal energy via conduction, convection, or radiation', distractors: ['Only through wires', 'Type of sound', 'Color change'] },
      { title: 'Materials Properties', explanation: 'Materials differ in strength, flexibility, and conductivity which matter when choosing materials for tools.', correct: 'Characteristics like strength and conductivity', distractors: ['Only color', 'Measurement unit', 'Number type'] },
      { title: 'Ecosystems in Science', explanation: 'Scientists study energy flow and cycles in ecosystems using experiments and observations to test ideas.', correct: 'Scientific study of organisms and their environment interactions', distractors: ['Only counting animals', 'History topic', 'Math problem'] },
      { title: 'Precision & Accuracy', explanation: 'Precision means repeating similar results; accuracy means closeness to the true value; both matter in experiments.', correct: 'Precision is repeatability; accuracy is closeness to true value', distractors: ['Only exact numbers', 'Force type', 'Chemical name'] },
      { title: 'Models in Science', explanation: 'Models simplify complex systems so scientists can test ideas; they can be physical, visual, or mathematical.', correct: 'Simplified representations to test and explain systems', distractors: ['Only toys', 'Chemical type', 'Music'] },
      { title: 'Conservation of Mass', explanation: 'In closed systems, mass remains constant during chemical reactions because atoms are rearranged, not lost.', correct: 'Total mass stays the same in closed systems during reactions', distractors: ['Mass always increases', 'Only in biology', 'Type of energy'] },
      { title: 'Variables in Experiments', explanation: 'Experiments use control, independent, and dependent variables to test cause and effect fairly.', correct: 'Control, independent, and dependent variables used to design tests', distractors: ['Only numbers on graph', 'Organism type', 'Historical fact'] },
    ],
    English: [
      { title: 'Parts of Speech', explanation: 'Parts of speech like nouns and verbs describe word roles in sentences and help with grammar and writing.', correct: 'Categories like nouns, verbs, and adjectives that describe word roles', distractors: ['Only about spelling', 'A math concept', 'Plant type'] },
      { title: 'Sentence Structure', explanation: 'Sentences contain a subject and predicate; clear structure helps meaning and improves writing.', correct: 'Subjects and predicates that make complete thoughts', distractors: ['Only list of words', 'Color name', 'Math rule'] },
      { title: 'Punctuation Basics', explanation: 'Punctuation marks like periods and commas separate ideas and help readers know pauses and sentence ends.', correct: 'Marks that structure and clarify writing', distractors: ['Only in poetry', 'A grammar error', 'Number type'] },
      { title: 'Main Idea & Details', explanation: 'The main idea is the central point of a paragraph and details support it; identifying both helps summarizing.', correct: 'Central point supported by details', distractors: ['Only first sentence', 'Punctuation type', 'Math formula'] },
      { title: 'Summarizing', explanation: 'Summarizing means retelling the main points briefly in your own words to show understanding.', correct: 'Brief restatement of main points in your own words', distractors: ['Copying whole text', 'Adding new facts', 'Spelling task'] },
      { title: 'Context Clues', explanation: 'Context clues are hints in a sentence that help define unknown words and improve reading comprehension.', correct: 'Hints in context that help infer word meanings', distractors: ['Only dictionary use', 'Punctuation rule', 'Math trick'] },
      { title: 'Vocabulary Building', explanation: 'Learning roots and usage helps grow vocabulary and using new words in writing makes them stick.', correct: 'Expanding words by studying roots and using them', distractors: ['Memorizing spelling', 'Only for poets', 'Number type'] },
      { title: 'Reading Comprehension', explanation: 'Comprehension is understanding meaning, tone, and purpose of a text; active reading strategies improve it.', correct: 'Understanding meaning and purpose of a text', distractors: ['Only reading quickly', 'Geometry type', 'Historical event'] },
      { title: 'Characters & Setting', explanation: 'Characters and setting shape a story’s events and mood; noticing them helps understand motives and plot.', correct: 'People and place/time of a story', distractors: ['Only book cover', 'List of words', 'Math problem'] },
      { title: 'Author’s Purpose', explanation: 'Authors write to inform, entertain, or persuade; spotting purpose uses tone and word choice as clues.', correct: 'Reason an author writes (inform, entertain, persuade)', distractors: ['Only to sell books', 'Punctuation rule', 'Plant type'] },
      { title: 'Tone & Mood', explanation: 'Tone is the author’s attitude; mood is the feeling created for the reader and both shape interpretation.', correct: 'Tone is attitude; mood is reader feeling', distractors: ['Book price', 'Only about characters', 'Math function'] },
      { title: 'Types of Writing', explanation: 'Narrative, persuasive, and informative writing have different goals and structures suited for different readers.', correct: 'Different forms like narrative and persuasive writing', distractors: ['Only poems', 'Math type', 'Food group'] },
      { title: 'Editing & Revising', explanation: 'Editing fixes grammar and spelling while revising improves ideas and organization to make writing stronger.', correct: 'Editing fixes mechanics; revising improves content', distractors: ['Only adding words', 'Skipping punctuation', 'Reading type'] },
      { title: 'Figurative Language', explanation: 'Similes and metaphors add vivid meaning to writing and help readers imagine ideas more clearly.', correct: 'Language like similes and metaphors that adds figurative meaning', distractors: ['Only long words', 'Math symbol', 'Test type'] },
      { title: 'Context & Inference', explanation: 'Inference uses clues and background knowledge to draw conclusions beyond what is directly stated.', correct: 'Using clues to draw conclusions beyond the text', distractors: ['Only pictures', 'Grammar rule', 'Punctuation'] },
      { title: 'Point of View', explanation: 'Point of view is who tells the story (first, second, third) and affects how much readers know.', correct: 'Narrator perspective that tells the story', distractors: ['Camera angles', 'Sentence type', 'Measurement'] },
      { title: 'Pronouns & Agreement', explanation: 'Pronouns replace nouns and must agree in number and gender to keep sentences clear.', correct: 'Words replacing nouns that must agree in number/gender', distractors: ['Only names of places', 'Verb type', 'Math operation'] },
      { title: 'Prefixes & Suffixes', explanation: 'Prefixes and suffixes change word meaning and form and help decode unfamiliar words.', correct: 'Affixes added to words to change meaning or function', distractors: ['Only in poetry', 'Sentence starter', 'Number type'] },
      { title: 'Dialogue Punctuation', explanation: 'Quotation marks and commas show spoken words correctly and keep conversations clear in writing.', correct: 'Rules for punctuating spoken words in writing', distractors: ['Only for titles', 'Math type', 'Music note'] },
      { title: 'Strong Introductions', explanation: 'Good introductions hook readers and state the main idea clearly to guide the rest of the piece.', correct: 'Beginning that grabs attention and states the main idea', distractors: ['Only the title', 'Closing sentence', 'List of facts'] },
      { title: 'Using Evidence', explanation: 'Evidence like facts or quotes supports claims and strengthens arguments when explained clearly.', correct: 'Using facts or quotes to support a claim', distractors: ['Only opinions', 'Grammar rule', 'Punctuation'] },
      { title: 'Tone Shifts', explanation: 'Shifts in tone change the reader’s feeling and can signal new ideas or a change in mood.', correct: 'A change in the author’s attitude or mood', distractors: ['Font change', 'Paragraph type', 'Math operation'] },
      { title: 'Making Predictions', explanation: 'Predictions guess what will happen next using clues, helping readers test their understanding.', correct: 'Using clues to guess future events in a text', distractors: ['Only about weather', 'Grammar rule', 'Cooking method'] },
      { title: 'Summarize vs Paraphrase', explanation: 'Summaries shorten main ideas while paraphrases restate details in new words; both show understanding differently.', correct: 'Summaries shorten; paraphrases restate in new words', distractors: ['They are identical', 'Only for math', 'Punctuation task'] },
    ],
  };

  return SUBJECT_DATA.map((sub, sIdx) => {
    const topics = SUBJECT_TOPICS[sub.name] || [];

    const chapters = [1, 2, 3].map((chId) => {
      const levels = Array.from({ length: 10 }, (_, lIdx) => {
        const levelNum = lIdx + 1;
        const topicIndex = (chId - 1) * 10 + lIdx;
        const topic = topics[topicIndex] || { title: `${sub.name} Topic ${chId}.${levelNum}`, explanation: `${sub.name} short explanation for ${chId}.${levelNum}.`, correct: 'Correct answer', distractors: ['Option A', 'Option B', 'Option C'] };

        const topicTitle = topic.title;
        const explanation = topic.explanation;
        const question = `Which statement best describes: ${topic.title}?`;
        const options = [topic.correct, ...topic.distractors].slice(0, 4);
        const correctIndex = 0;

        let status: Level['status'] = 'locked';
        let stars = 0;

        if (chId === 1) {
          if (levelNum <= 3) {
            status = 'completed';
            stars = 3;
          } else if (levelNum === 4) {
            status = 'current';
          }
        }

        return {
          id: levelNum,
          status,
          stars,
          topicTitle,
          explanation,
          quiz: { question, options, correctIndex },
        };
      });

      return {
        id: chId,
        name: `Chapter ${chId}`,
        subject: sub.name,
        levels,
      } as Chapter;
    });

    return {
      id: `subject-${sIdx}`,
      name: sub.name,
      emoji: sub.emoji,
      chapters,
    } as Subject;
  });
}

const initialSubjects: Subject[] = generateInitialSubjects();

type View = 'subjects' | 'chapters' | 'levels' | 'lesson';

export function LevelRoadmap() {
  const [view, setView] = useState<View>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [weakTopics, setWeakTopics] = useState<Array<{ subject: string; chapter: number; level: number; topic: string }>>([]);
  const { companion } = useTheme();
  const [celebration, setCelebration] = useState<{ levelId: number; show: boolean } | null>(null);

  useEffect(() => {
  const intent = localStorage.getItem('learnIntent');
  if (intent) {
    const { subject, chapter } = JSON.parse(intent);
    // auto-select subject + chapter
    localStorage.removeItem('learnIntent');
  }
}, []);

  useEffect(() => {
    async function loadProgress() {
      const res = await fetch("http://localhost:5000/api/progress", {
        headers: {
          Authorization: localStorage.getItem("token") || "",
        },
      });

      const completed = await res.json();

      setSubjects((prev) => {
        const copy = JSON.parse(JSON.stringify(prev));

        completed.forEach((p: any) => {
          const subject = copy.find((s: any) => s.name === p.subject);
          if (!subject) return;

          const chapter = subject.chapters.find(
            (c: any) => c.id === p.chapterNumber
          );
          if (!chapter) return;

          const level = chapter.levels.find(
            (l: any) => l.id === p.levelNumber
          );
          if (!level) return;

          level.status = "completed";
          level.stars = 3;
        });

        // unlock next levels
        copy.forEach((subject: any) => {
          subject.chapters.forEach((chapter: any) => {
            for (let i = 0; i < chapter.levels.length - 1; i++) {
              if (
                chapter.levels[i].status === "completed" &&
                chapter.levels[i + 1].status === "locked"
              ) {
                chapter.levels[i + 1].status = "current";
              }
            }
          });
        });

        return copy;
      });
    }

    loadProgress();
  }, []);

  useEffect(() => {
    async function loadProgress() {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/progress/mine", {
        headers: { Authorization: token }
      });

      const data = await res.json();

      setSubjects(prev => {
        const copy = JSON.parse(JSON.stringify(prev));

        data.forEach((p: any) => {
          const subject = copy.find((s: any) => s.name === p.subject);
          if (!subject) return;

          const chapter = subject.chapters.find((c: any) => c.id === p.chapterNumber);
          if (!chapter) return;

          const level = chapter.levels.find((l: any) => l.id === p.levelNumber);
          if (!level) return;

          level.status = "completed";
          level.stars = 3;

          // unlock next level
          const idx = chapter.levels.findIndex((l: any) => l.id === level.id);
          if (chapter.levels[idx + 1] && chapter.levels[idx + 1].status === "locked") {
            chapter.levels[idx + 1].status = "current";
          }
        });

        return copy;
      });
    }

    loadProgress();
  }, []);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);



  // No persistence in this component — UI-only state handled below

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubjectId(subject.id);
    setView('chapters');
  };

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapterId(chapter.id);
    setView('levels');
  };

  const handleLevelClick = (level: Level) => {
    if (level.status !== 'locked') {
      setSelectedLevelId(level.id);
      setView('lesson');
    }
  };

  const goBack = () => {
    if (view === 'chapters') {
      setView('subjects');
      setSelectedSubjectId(null);
    } else if (view === 'levels') {
      setView('chapters');
      setSelectedChapterId(null);
    } else if (view === 'lesson') {
      setView('levels');
      setSelectedLevelId(null);
    }
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-0.5 mt-1">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= count ? 'fill-primary text-primary' : 'text-muted'}`}
          />
        ))}
      </div>
    );
  };

  // Derived selections from id-based state
  const selectedSubject = selectedSubjectId ? subjects.find((s) => s.id === selectedSubjectId) || null : null;
  const selectedChapter = selectedSubject && selectedChapterId ? selectedSubject.chapters.find((c) => c.id === selectedChapterId) || null : null;
  const selectedLevel = selectedChapter && selectedLevelId ? selectedChapter.levels.find((l) => l.id === selectedLevelId) || null : null;

  // show a short celebration when a level becomes completed
  useEffect(() => {
    if (selectedLevel && selectedLevel.status === 'completed') {
      // avoid re-showing for same level
      if (!celebration || celebration.levelId !== selectedLevel.id) {
        setCelebration({ levelId: selectedLevel.id, show: true });
        const h = setTimeout(() => setCelebration(null), 2800);
        return () => clearTimeout(h);
      }
    }
    return;
  }, [selectedLevel?.id, selectedLevel?.status]);

  async function handleAnswer(selectedIndex: number) {
    if (!selectedSubject || !selectedChapter || !selectedLevel) return;
    const subject = selectedSubject;
    const chapter = selectedChapter;
    const correct = selectedIndex === selectedLevel.quiz.correctIndex;

    if (correct) {

      setMessage("🎉 Correct! You’ve unlocked the next level!");


      await fetch("http://localhost:5000/api/progress/complete-level", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") || ""
        },
        body: JSON.stringify({
          subject: selectedSubject.name,
          chapterNumber: selectedChapter.id,
          levelNumber: selectedLevel.id,
          score: 100
        })
      });
      setSubjects((prev) => {
        const copy = JSON.parse(JSON.stringify(prev)) as Subject[];
        const sIdx = copy.findIndex((s) => s.id === subject.id);
        if (sIdx === -1) return prev;
        const cIdx = copy[sIdx].chapters.findIndex((c) => c.id === chapter.id);
        if (cIdx === -1) return prev;

        const levels = copy[sIdx].chapters[cIdx].levels;
        const lvlIdx = levels.findIndex((l) => l.id === selectedLevel.id);
        if (lvlIdx === -1) return prev;

        // mark current level completed
        levels[lvlIdx].status = 'completed';
        levels[lvlIdx].stars = 3;

        // unlock next level in the same chapter
        if (lvlIdx + 1 < levels.length) {
          if (levels[lvlIdx + 1].status === 'locked') {
            levels[lvlIdx + 1].status = 'current';
          }

        } else {
          // if the last level is completed, check if the entire chapter is now completed
          const allCompleted = levels.every((lv) => lv.status === 'completed');
          if (allCompleted) {
            const nextChapter = copy[sIdx].chapters[cIdx + 1];
            // unlock the first level of the next chapter
            if (nextChapter && nextChapter.levels[0].status === 'locked') {
              nextChapter.levels[0].status = 'current';
            }
          }
        }

        return copy;
      });
    } else {
      setMessage('⚠️ Oops! This topic seems weak. Revise it to unlock the next level.');
      setWeakTopics((prev) => {
        const exists = prev.some((w) => w.subject === subject.name && w.chapter === chapter.id && w.level === selectedLevel.id);
        if (exists) return prev;
        return [...prev, { subject: subject.name, chapter: chapter.id, level: selectedLevel.id, topic: selectedLevel.topicTitle }];
      });
    }
  }

  if (view === 'chapters' && selectedSubject) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subjects
        </Button>

        <h1 className="text-2xl font-bold text-foreground mb-6 text-center">{selectedSubject.name}</h1>

        <div className="space-y-4">
          {selectedSubject.chapters.map((chapter) => {
            const completedCount = chapter.levels.filter((lv) => lv.status === 'completed').length;
            const progressPercent = Math.round((completedCount / 10) * 100);
            const isFullyLocked = chapter.levels.every((lv) => lv.status === 'locked');
            const isCurrent = chapter.levels.some((lv) => lv.status === 'current' || lv.status === 'completed');

            return (
              <button
                key={chapter.id}
                onClick={() => handleChapterClick(chapter)}
                className={`w-full flex items-center gap-4 p-6 rounded-2xl transition-transform transform hover:scale-105 active:scale-100 bg-white/60 dark:bg-slate-800/60 shadow-lg hover:shadow-2xl relative overflow-hidden ${isFullyLocked ? 'opacity-70 grayscale' : 'ring-0'} `}
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold bg-gradient-to-br from-primary/60 to-secondary/40 text-primary-foreground shadow-sm">
                    {chapter.id}
                  </div>
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">{chapter.name}</h3>
                    <div className="text-sm text-muted-foreground">{completedCount}/10 levels completed ({progressPercent}%)</div>
                  </div>
                  <p className="text-sm mt-2 text-foreground/80">
                    {isFullyLocked ? (
                      chapter.id === 1 ? (
                        'Locked — start with the earlier levels'
                      ) : (
                        <>Unlock by completing Chapter {chapter.id - 1} 🔒</>
                      )
                    ) : isCurrent ? (
                      <>Ready to learn — Let’s go! 🚀</>
                    ) : (
                      <>Locked for now 😴</>
                    )}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <BookOpen className={`w-6 h-6 ${isFullyLocked ? 'text-muted-foreground' : 'text-primary'}`} />
                </div>

                <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-yellow-100/80 flex items-center justify-center text-xs shadow-md">⭐</span>
                <span className="absolute left-2 top-2 w-2 h-2 rounded-full bg-white/40 blur-sm" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'subjects') {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-foreground">Learning Path</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const subtitleMap: Record<string, string> = {
              Biology: 'Explore life 🌱',
              Mathematics: 'Crack numbers 🔢',
              History: 'Travel through time 🏛️',
              Science: 'Discover the world 🔬',
              English: 'Master words ✍️',
            };
            const subtitle = subtitleMap[subject.name] || `${subject.chapters.length} Chapters`;

            return (
              <button
                key={subject.id}
                onClick={() => handleSubjectClick(subject)}
                className="relative p-8 rounded-3xl shadow-2xl transform transition-all hover:scale-105 active:scale-100 bg-gradient-to-br from-white/70 to-white/40 dark:from-slate-800/60 dark:to-slate-700/50 overflow-hidden"
              >
                <div className="absolute -top-6 -left-10 opacity-30 text-6xl">{subject.emoji}</div>
                <div className="relative flex flex-col items-start gap-3">
                  <div className="text-5xl leading-none">{subject.emoji}</div>
                  <h3 className="text-2xl font-extrabold text-foreground">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                </div>

                <div className="absolute right-4 top-4 px-2 py-1 rounded-full bg-gradient-to-r from-pink-300 to-yellow-300 text-xs font-semibold shadow-sm">{subject.chapters.length} Chapters</div>
                <span className="absolute -bottom-4 -right-6 w-24 h-24 rounded-full bg-primary/10 blur-3xl" />
                <span className="absolute top-3 left-3 w-2 h-2 bg-white/60 rounded-full" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'levels' && selectedChapter) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Chapters
        </Button>

        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">{selectedChapter.name}</h1>
        <div className="text-center text-sm text-muted-foreground mb-6">
          {selectedChapter.levels.filter((lv) => lv.status === 'completed').length}/10 levels completed ({Math.round((selectedChapter.levels.filter((lv) => lv.status === 'completed').length / 10) * 100)}%)
        </div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-border h-full" />

          <div className="flex flex-col space-y-6">
            {selectedChapter.levels.map((level, index) => {
              const isLeft = index % 2 === 0;
              const locked = level.status === 'locked';
              const completed = level.status === 'completed';
              const current = level.status === 'current';

              return (
                <div key={level.id} className="relative flex items-center w-full">
                  <div className={`w-1/2 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className={`inline-block max-w-[320px] ${isLeft ? 'mr-auto' : 'ml-auto'}`}>
                      <div className={`inline-flex items-center gap-3 p-4 rounded-2xl ${completed ? 'bg-green-50 border border-green-200' : current ? 'bg-primary/10 border border-primary/30 animate-pulse' : 'bg-muted-foreground/5 border border-border'} transition-shadow shadow-sm`}>
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold">
                          {completed ? <Check className="w-5 h-5 text-green-600" /> : locked ? <Lock className="w-5 h-5 text-muted-foreground" /> : <span className="text-foreground">{level.id}</span>}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-foreground">Level {level.id}</div>
                          <div className="text-sm text-muted-foreground mt-1">{locked ? 'Locked for now 😴' : current ? 'Start here 🚀' : 'Completed ⭐'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center -mx-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${completed ? 'bg-green-200' : current ? 'bg-primary/20' : 'bg-muted-foreground/20'}`}>
                      {completed ? <Check className="w-5 h-5 text-green-600" /> : locked ? <Lock className="w-4 h-4 text-muted-foreground" /> : <div className="text-sm font-bold">{level.id}</div>}
                    </div>
                  </div>

                  <div className={`w-1/2 ${isLeft ? 'pl-8 text-left' : 'pr-8 text-right'}`}>
                    <div className={`inline-block max-w-[320px] ${isLeft ? 'ml-6' : 'mr-6'}`}>
                      <div className={`p-4 rounded-2xl ${isLeft ? '' : ''} bg-white/60 shadow-sm`}>
                        <div className="font-semibold text-foreground">{level.topicTitle}</div>
                        <div className="text-sm text-muted-foreground mt-1">{locked ? 'Unlock by completing previous levels' : level.explanation.split('.').slice(0, 2).join('.')}.</div>
                        <div className="mt-3">
                          <Button variant="ghost" onClick={() => handleLevelClick(level)} disabled={locked}>
                            {locked ? 'Locked' : 'Start learning 🎯'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'lesson' && selectedLevel && selectedSubject && selectedChapter) {
    const quizOptions = selectedLevel.quiz?.options ?? ['Option A', 'Option B', 'Option C', 'Option D'];
    const quizQuestion = selectedLevel.quiz?.question ?? `Quick question about ${selectedChapter.name}`;

    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Levels
        </Button>

        <div className="cartoon-card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Level {selectedLevel.id}: {selectedLevel.topicTitle}</h1>
              <p className="text-muted-foreground">{selectedLevel.explanation.split('.').slice(0, 2).join('.')}.</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-foreground leading-relaxed">
              {selectedLevel.explanation}
            </p>
          </div>
        </div>

        {/* Practice Task */}
        <div className="cartoon-card">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Quick Quiz!</h2>
          </div>

          <p className="text-foreground mb-4">{quizQuestion}</p>

          <div className="space-y-3">
            {quizOptions.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-muted/50 transition-all font-medium text-foreground"
              >
                {option}
              </button>
            ))}
          </div>
          {message && (
            <div className="mt-4 text-sm font-medium">{message}</div>
          )}

          <div className="mt-4">
            <div className="text-xs text-muted-foreground">Weak topics this session:</div>
            <ul className="mt-2 text-sm space-y-1">
              {weakTopics.length > 0 ? (
                weakTopics.map((w, i) => (
                  <li key={i} className="truncate">{w.subject} — Ch{w.chapter} L{w.level}: {w.topic}</li>
                ))
              ) : (
                <li className="text-muted-foreground">None</li>
              )}
            </ul>
          </div>
        </div>

        {/* Celebration banner (non-overlapping, between sections) */}
        {celebration?.show && celebration.levelId === selectedLevel.id && (
          <div
            role="status"
            aria-live="polite"
            className="mx-auto max-w-3xl my-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center gap-3 transition-opacity duration-300"
          >
            <div className="text-2xl">🎉</div>
            <div className="text-sm font-semibold">Level complete! You’re on fire 🔥</div>
          </div>
        )}

        {/* Companion encouragement */}
        <div className="mt-6 flex justify-center">
          <CompanionAvatar size="md" showBubble message="You've got this! 🌟" />
        </div>

        {/* Next Level button (visible only after completion) */}
        <div className="mt-6 flex justify-center">
          {selectedLevel.status === 'completed' && (
            (() => {
              const levels = selectedChapter.levels;
              const idx = levels.findIndex((l) => l.id === selectedLevel.id);
              const next = idx !== -1 ? levels[idx + 1] : null;
              // if no next in this chapter, check next chapter's first level
              let nextAvailable = next;
              let nextChapterId: number | null = null;
              if (!next) {
                const sIdx = subjects.findIndex((s) => s.id === selectedSubject.id);
                if (sIdx !== -1) {
                  const nextChap = subjects[sIdx].chapters.find((c) => c.id === selectedChapter.id + 1);
                  if (nextChap) {
                    nextAvailable = nextChap.levels[0];
                    nextChapterId = nextChap.id;
                  }
                }
              }

              const canAdvance = !!nextAvailable && nextAvailable.status !== 'locked';

              const handleNext = () => {
                if (!canAdvance || !nextAvailable) return;
                // if advancing to a level in the same chapter
                if (next && nextAvailable.id === next.id) {
                  setSelectedLevelId(next.id);
                } else {
                  // advance to next chapter's first level
                  if (nextChapterId) setSelectedChapterId(nextChapterId);
                  setSelectedLevelId(nextAvailable.id);
                }
              };

              return (
                <div>
                  <Button onClick={handleNext} disabled={!canAdvance} aria-disabled={!canAdvance} className="ml-2">
                    Next Level →
                  </Button>
                  {!canAdvance && (
                    <div className="text-xs text-muted-foreground mt-2 text-center">Next level locked — finish the previous one to unlock.</div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
    );
  }

  return null;
}