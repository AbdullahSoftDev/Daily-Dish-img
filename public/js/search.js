// Search functionality for index.html
function initSearch() {
    // Hero search
    const heroSearch = document.getElementById('heroSearch');
    if (heroSearch) {
        heroSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Modal search
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('search-icon-1');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performModalSearch();
            }
        });
    }
    
    if (searchIcon) {
        searchIcon.addEventListener('click', performModalSearch);
    }
}

function performSearch() {
    const searchTerm = document.getElementById('heroSearch')?.value.trim();
    if (searchTerm) {
        window.location.href = `shop.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

function performModalSearch() {
    const searchTerm = document.getElementById('searchInput')?.value.trim();
    if (searchTerm) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
        if (modal) modal.hide();
        window.location.href = `shop.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

// Initialize search when DOM loads
document.addEventListener('DOMContentLoaded', initSearch);