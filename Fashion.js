// gallery.js
document.addEventListener('DOMContentLoaded', function() {
    const applyFiltersBtn = document.getElementById('apply-filters');
    
    applyFiltersBtn.addEventListener('click', function() {
        const category = document.getElementById('category-filter').value;
        const color = document.getElementById('color-filter').value;
        
        //this would filter the gallery things
        console.log(`Filtering by: Category - ${category}, Color - ${color}`);
        alert('Filter functionality will be fully implemented in the next version');
    });
});