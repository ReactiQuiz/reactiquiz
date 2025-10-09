// src/components/ResultsActionButtons.js
import { Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History'; 
import { Button } from '@mui/material';
// import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi'; // Removed

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