/**
 * Character Manager Setup - Handles renaming and fallback logic
 * between 3D (CharacterManager) and 2D (CharacterManager2D) managers
 */
(function () {
    // After character_manager.js loads, rename to avoid conflicts
    if (typeof CharacterManager !== 'undefined') {
        window.CharacterManager3D = CharacterManager;
        console.log('3D CharacterManager loaded');
    }
})();
