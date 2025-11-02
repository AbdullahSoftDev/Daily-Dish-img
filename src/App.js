import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [cartCount, setCartCount] = useState(3);
  const [quickMeals, setQuickMeals] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Your existing products array
  const products = [
    { id: 1, name: "Oranges", price: "$4.99", image: "img/featur-1.jpg", category: "fruits" },
    { id: 2, name: "Fresh Tomato", price: "$3.99", image: "img/featur-2.jpg", category: "vegetables" },
    // ... add your other products
  ];

  // Quick meals database
  const quickMealsDatabase = [
    // Category 1: Burgers & Sandwiches
    { id: 1, name: "Grilled Chicken Burger", category: "Burgers & Sandwiches", time: "15 mins", type: "Non-Veg" },
    { id: 2, name: "Shami Burger (Bun Kebab)", category: "Burgers & Sandwiches", time: "20 mins", type: "Non-Veg" },
    { id: 3, name: "Aloo Tikki Burger", category: "Burgers & Sandwiches", time: "25 mins", type: "Veg" },
    { id: 4, name: "Steak Sandwich", category: "Burgers & Sandwiches", time: "18 mins", type: "Non-Veg" },
    { id: 5, name: "Club Sandwich", category: "Burgers & Sandwiches", time: "22 mins", type: "Non-Veg" },
    
    // Category 2: Wraps & Rolls
    { id: 6, name: "Malai Boti Roll", category: "Wraps & Rolls", time: "20 mins", type: "Non-Veg" },
    { id: 7, name: "Seekh Kebab Roll", category: "Wraps & Rolls", time: "25 mins", type: "Non-Veg" },
    { id: 8, name: "Chicken Quesadilla", category: "Wraps & Rolls", time: "15 mins", type: "Non-Veg" },
    { id: 9, name: "Falafel Wrap", category: "Wraps & Rolls", time: "18 mins", type: "Veg" },
    
    // Add more categories as needed...
  ];

  // AI Function: Get daily quick meals (shuffled)
  const getDailyQuickMeals = () => {
    const shuffled = [...quickMealsDatabase].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6); // Get 6 random meals for today
  };

  // AI Function: Generate weekly schedule
  const generateWeeklySchedule = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const shuffledMeals = [...quickMealsDatabase].sort(() => 0.5 - Math.random());
    
    const schedule = days.map((day, index) => ({
      day,
      breakfast: shuffledMeals[index % shuffledMeals.length],
      lunch: shuffledMeals[(index + 3) % shuffledMeals.length],
      dinner: shuffledMeals[(index + 6) % shuffledMeals.length]
    }));
    
    return schedule;
  };

  // AI Function: Surprise me with random dish
  const surpriseMe = () => {
    setIsSpinning(true);
    setShowCelebration(false);
    
    let speed = 100;
    let count = 0;
    const maxCount = 30;
    
    const spinInterval = setInterval(() => {
      const randomDish = quickMealsDatabase[Math.floor(Math.random() * quickMealsDatabase.length)];
      setSelectedDish(randomDish);
      count++;
      
      // Gradually slow down
      if (count > maxCount / 2) {
        speed += 20;
      }
      if (count > (maxCount * 2) / 3) {
        speed += 50;
      }
      
      if (count >= maxCount) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        setShowCelebration(true);
        
        // Hide celebration after 3 seconds
        setTimeout(() => {
          setShowCelebration(false);
        }, 3000);
      }
    }, speed);
  };

  // AI Function: Search dishes
  const searchDishes = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = quickMealsDatabase.filter(meal => 
      meal.name.toLowerCase().includes(query.toLowerCase()) ||
      meal.category.toLowerCase().includes(query.toLowerCase()) ||
      meal.type.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results.slice(0, 5)); // Show top 5 results
  };

  // Load daily quick meals on component mount
  useEffect(() => {
    setQuickMeals(getDailyQuickMeals());
  }, []);

  const addToCart = (productName) => {
    setCartCount(prev => prev + 1);
    alert(`${productName} added to cart!`);
  };

  return (
    <div className="App">
      {/* Your existing Navbar code */}
      
      {/* Updated Hero Section with AI buttons */}
      <div className="container-fluid py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row g-5 align-items-center">
            <div className="col-md-12 col-lg-7">
              <h4 className="mb-3 text-secondary">Your Cooking Companion</h4>
              <h1 className="mb-5 display-3 text-primary">Never Wonder What To Cook Again.</h1>
              
              {/* AI Features Buttons */}
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <button className="btn btn-primary w-100 py-3" onClick={() => setWeeklySchedule(generateWeeklySchedule())}>
                    📅 Weekly Schedule
                  </button>
                </div>
                <div className="col-md-4">
                  <button className="btn btn-success w-100 py-3" onClick={surpriseMe} disabled={isSpinning}>
                    {isSpinning ? '🎯 Selecting...' : '🎲 Surprise Me!'}
                  </button>
                </div>
                <div className="col-md-4">
                  <div className="position-relative">
                    <input 
                      type="text" 
                      className="form-control py-3" 
                      placeholder="Search dishes..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchDishes(e.target.value);
                      }}
                    />
                    {searchResults.length > 0 && (
                      <div className="dropdown-menu show w-100">
                        {searchResults.map(dish => (
                          <button 
                            key={dish.id}
                            className="dropdown-item"
                            onClick={() => {
                              setSelectedDish(dish);
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                          >
                            {dish.name} ({dish.type}) - {dish.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="position-relative mx-auto">
                <input className="form-control border-2 border-secondary w-75 py-3 px-4 rounded-pill" type="text" placeholder="Search for dishes..." />
                <button type="submit" className="btn btn-primary border-2 border-secondary py-3 px-4 position-absolute rounded-pill text-white h-100" style={{top: 0, right: '25%'}}>Search</button>
              </div>
            </div>
            <div className="col-md-12 col-lg-5">
              {/* Your carousel code remains the same */}
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="confetti">🎉</div>
          <div className="confetti">🎊</div>
          <div className="confetti">🥳</div>
          <div className="confetti">👏</div>
          <div className="confetti">🎯</div>
        </div>
      )}

      {/* Selected Dish Display */}
      {selectedDish && (
        <div className="container-fluid py-3 bg-light">
          <div className="container">
            <div className="alert alert-success text-center">
              <h4>🎯 Selected: {selectedDish.name}</h4>
              <p className="mb-0">Category: {selectedDish.category} | Type: {selectedDish.type} | Time: {selectedDish.time}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Meals Section */}
      <div className="container-fluid py-5">
        <div className="container">
          <h2 className="text-center mb-5">🚀 Today's Quick Meals</h2>
          <div className="row g-4">
            {quickMeals.map(meal => (
              <div key={meal.id} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center">
                    <h5 className="card-title">{meal.name}</h5>
                    <p className="card-text">
                      <small className="text-muted">{meal.category}</small><br/>
                      <span className="badge bg-primary">{meal.type}</span>
                      <span className="badge bg-secondary ms-1">{meal.time}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      {weeklySchedule.length > 0 && (
        <div className="container-fluid py-5 bg-light">
          <div className="container">
            <h2 className="text-center mb-5">📅 Your Weekly Schedule</h2>
            <div className="row g-4">
              {weeklySchedule.map((day, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <div className="card border-0 shadow">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">{day.day}</h5>
                    </div>
                    <div className="card-body">
                      <p><strong>Breakfast:</strong> {day.breakfast.name}</p>
                      <p><strong>Lunch:</strong> {day.lunch.name}</p>
                      <p><strong>Dinner:</strong> {day.dinner.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Your existing Features, Products, and Footer sections */}
      
    </div>
  );
}

export default App;