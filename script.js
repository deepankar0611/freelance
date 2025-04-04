let slideIndex = 0;
const slider = document.querySelector('.slider');
const slidesContainer = document.querySelector('.slides-container');
const slides = document.getElementsByClassName("slide");
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID = 0;
let currentIndex = 0;

// Initialize the slider
function initSlider() {
    if (slides.length > 0) {
        // Set initial position
        setPositionByIndex();
        
        // Add touch and mouse event listeners to the slider
        slider.addEventListener('mousedown', dragStart);
        slider.addEventListener('mousemove', drag);
        slider.addEventListener('mouseup', dragEnd);
        slider.addEventListener('mouseleave', dragEnd);
        
        // Touch events
        slider.addEventListener('touchstart', dragStart);
        slider.addEventListener('touchmove', drag);
        slider.addEventListener('touchend', dragEnd);

        // Prevent context menu
        window.oncontextmenu = function(event) {
            if (event.target.closest('.slider')) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        }
    }
}

function dragStart(event) {
    if (event.type === 'touchstart') {
        startPos = event.touches[0].clientX;
    } else {
        startPos = event.clientX;
        event.preventDefault();
    }
    
    isDragging = true;
    animationID = requestAnimationFrame(animation);
    slidesContainer.style.transition = 'none';
    
    // Remove active class from all slides when starting to drag
    Array.from(slides).forEach(slide => {
        slide.classList.remove('active');
    });
}

function drag(event) {
    if (isDragging) {
        const currentPosition = event.type === 'touchmove' ? 
            event.touches[0].clientX : event.clientX;
        const diff = currentPosition - startPos;
        currentTranslate = prevTranslate + diff;
        
        // Prevent overscrolling
        const maxTranslate = 0;
        const minTranslate = -(slides.length - 1) * slider.offsetWidth;
        currentTranslate = Math.max(Math.min(currentTranslate, maxTranslate), minTranslate);
    }
}

function dragEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);
    
    const movedBy = currentTranslate - prevTranslate;
    
    // If moved enough negative -> next slide
    if (movedBy < -100 && currentIndex < slides.length - 1) {
        currentIndex += 1;
    }
    // If moved enough positive -> previous slide
    if (movedBy > 100 && currentIndex > 0) {
        currentIndex -= 1;
    }
    
    setPositionByIndex();
}

function animation() {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
}

function setPositionByIndex() {
    currentTranslate = currentIndex * -slider.offsetWidth;
    prevTranslate = currentTranslate;
    setSliderPosition();
    slidesContainer.style.transition = 'transform 0.3s ease-out';
    
    // Update active slide for text animation
    Array.from(slides).forEach((slide, index) => {
        if (index === currentIndex) {
            slide.classList.add('active');
            // Reset animation by removing and re-adding the text element
            const slideText = slide.querySelector('.slide-text');
            if (slideText) {
                const parent = slideText.parentNode;
                const clone = slideText.cloneNode(true);
                parent.removeChild(slideText);
                parent.appendChild(clone);
            }
        } else {
            slide.classList.remove('active');
        }
    });
}

function setSliderPosition() {
    slidesContainer.style.transform = `translateX(${currentTranslate}px)`;
}

// Change slide when arrows are clicked
function changeSlide(n) {
    currentIndex = Math.max(0, Math.min(currentIndex + n, slides.length - 1));
    setPositionByIndex();
}

// Show the current slide
function showSlides(n) {
    // Reset slideIndex if it's out of bounds
    if (n >= slides.length) {
        slideIndex = 0;
    }
    if (n < 0) {
        slideIndex = slides.length - 1;
    }

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active");
        // Reset animation by removing and re-adding the slide-text element
        const slideText = slides[i].querySelector('.slide-text');
        if (slideText) {
            const parent = slideText.parentNode;
            const clone = slideText.cloneNode(true);
            parent.removeChild(slideText);
            parent.appendChild(clone);
        }
    }

    // Show the current slide
    slides[slideIndex].classList.add("active");
}

// Handle form submission
document.querySelector('.booking-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Add your booking form submission logic here
    console.log('Booking form submitted');
});

// Initialize the slider when the page loads
document.addEventListener('DOMContentLoaded', initSlider);

// Calendar functionality
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('dateRange');
    const calendarDropdown = document.querySelector('.calendar-dropdown');
    const calendar = document.querySelector('.calendar');
    const currentMonthSpan = document.querySelector('.current-month');
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');

    let currentDate = new Date();
    let selectedStartDate = null;
    let selectedEndDate = null;

    // Show calendar when clicking the input
    dateInput.addEventListener('click', function(e) {
        e.stopPropagation();
        calendarDropdown.classList.toggle('active');
        renderCalendar(currentDate);
    });

    // Hide calendar when clicking outside
    document.addEventListener('click', function(e) {
        if (!calendarDropdown.contains(e.target) && e.target !== dateInput) {
            calendarDropdown.classList.remove('active');
        }
    });

    // Previous month button
    prevMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    // Next month button
    nextMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const monthLength = lastDay.getDate();

        currentMonthSpan.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;
        calendar.innerHTML = '';

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            calendar.appendChild(document.createElement('div'));
        }

        // Add calendar dates
        for (let day = 1; day <= monthLength; day++) {
            const dateDiv = document.createElement('div');
            dateDiv.classList.add('calendar-date');
            dateDiv.textContent = day;
            
            const currentDateObj = new Date(year, month, day);
            
            // Disable past dates
            if (currentDateObj < new Date(new Date().setHours(0,0,0,0))) {
                dateDiv.classList.add('disabled');
            } else {
                if (isDateInRange(currentDateObj)) {
                    dateDiv.classList.add('selected');
                }
                if (selectedStartDate && currentDateObj.getTime() === selectedStartDate.getTime()) {
                    dateDiv.classList.add('start-date');
                }
                if (selectedEndDate && currentDateObj.getTime() === selectedEndDate.getTime()) {
                    dateDiv.classList.add('end-date');
                }
            }

            dateDiv.addEventListener('click', function() {
                if (!dateDiv.classList.contains('disabled')) {
                    handleDateSelection(currentDateObj);
                }
            });

            calendar.appendChild(dateDiv);
        }
    }

    function handleDateSelection(date) {
        if (!selectedStartDate || (selectedStartDate && selectedEndDate) || date < selectedStartDate) {
            // Start new selection
            selectedStartDate = date;
            selectedEndDate = null;
        } else {
            // Complete the selection
            selectedEndDate = date;
        }

        updateDateInput();
        renderCalendar(currentDate);
    }

    function isDateInRange(date) {
        if (!selectedStartDate) return false;
        if (!selectedEndDate) return date.getTime() === selectedStartDate.getTime();
        return date >= selectedStartDate && date <= selectedEndDate;
    }

    function updateDateInput() {
        const formatDate = (date) => {
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });
        };

        if (selectedStartDate && selectedEndDate) {
            dateInput.value = `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`;
            calendarDropdown.classList.remove('active');
        } else if (selectedStartDate) {
            dateInput.value = formatDate(selectedStartDate);
        }
    }
}); 