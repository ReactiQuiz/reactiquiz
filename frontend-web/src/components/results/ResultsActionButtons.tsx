// src/components/results/ResultsActionButtons.tsx
/**
 * Results Action Buttons Component
 * 
 * This component displays action buttons for quiz results pages.
 * It includes navigation buttons (back to list, home, view history)
 * and action buttons (delete result) with conditional visibility.
 */
import { Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History'; 
import { Button } from '@mui/material';
// import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi'; // Removed

/**
 * Results Action Buttons Component
 * 
 * Displays action buttons for quiz results. Features:
 * - Back to list button (conditional)
 * - View history button (conditional)
 * - Home/navigation button
 * - Delete result button (conditional)
 * - Responsive button sizing
 * 
 * This component is used on ResultsPage and result detail pages
 * to provide navigation and action buttons.
 * 
 * @param {Object} props - Component props
 * @param {() => void} [props.onBackToList] - Callback to go back to results list (optional)
 * @param {() => void} props.onNavigateHome - Callback to navigate to home/dashboard
 * @param {() => void} [props.onViewHistory] - Callback to view full history (optional)
 * @param {boolean} [props.showBackToListButton] - Whether to show back to list button (optional)
 * @param {boolean} [props.showViewHistoryButton] - Whether to show view history button (optional)
 * @param {string} props.accentColor - Accent color for styling
 * @param {boolean} [props.showDeleteButton] - Whether to show delete button (optional)
 * @param {() => void} [props.onDeleteClick] - Callback to delete result (optional)
 * @param {boolean} [props.deleteDisabled] - Whether delete button is disabled (optional)
 * @returns {JSX.Element} Action buttons container
 */
function ResultsActionButtons({
    onBackToList,
    onNavigateHome,
    onViewHistory, 
    showBackToListButton,
    showViewHistoryButton, 
    accentColor,
    showDeleteButton,
    onDeleteClick,
    deleteDisabled,
    // onChallengeFriend, // Removed
    // showChallengeButton,  // Removed
    // currentUser // Removed
}) {
    
    return (
        <Box sx={{ mt: 4, py: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {showBackToListButton && onBackToList && (
                <Button variant="outlined" size="medium" startIcon={<ArrowBackIcon />} onClick={onBackToList} sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: {xs: '100%', sm:'200px'} }}>
                    Back to List
                </Button>
            )}
             {showViewHistoryButton && onViewHistory && (
                <Button variant="contained" size="medium" startIcon={<HistoryIcon />} onClick={onViewHistory} sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: {xs: '100%', sm:'200px'} }}>
                    View Full History
                </Button>
            )}
            {/* Challenge Friend Button Removed */}
            <Button variant="contained" color="primary" size="medium" startIcon={<HomeIcon />} onClick={onNavigateHome} sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { xs: '100%', sm: '220px' } }}>
                { (showBackToListButton || showViewHistoryButton) ? "Home" : "Back to Home"}
            </Button>
            {showDeleteButton && onDeleteClick && (
                <Button
                    variant="outlined"
                    size="medium"
                    startIcon={<DeleteIcon />}
                    onClick={onDeleteClick}
                    disabled={deleteDisabled}
                    sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: {xs: '100%', sm:'220px'} }}
                    color="error"
                >
                    Delete This Result
                </Button>
            )}
        </Box>
    );
}

export default ResultsActionButtons;