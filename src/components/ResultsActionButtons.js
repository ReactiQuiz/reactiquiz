// src/components/ResultsActionButtons.js
import {
    Box, Button, useTheme, alpha, darken
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History'; 
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi'; // Import

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
    onChallengeFriend, // New prop
    showChallengeButton,  // New prop
    currentUser
}) {
    const theme = useTheme();
    const effectiveAccentColor = accentColor || theme.palette.primary.main;

    return (
        <Box sx={{ mt: 4, py: 2, display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {showBackToListButton && onBackToList && (
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBackToList}
                    sx={{ borderColor: effectiveAccentColor, color: effectiveAccentColor, '&:hover': { borderColor: darken(effectiveAccentColor, 0.15), backgroundColor: alpha(effectiveAccentColor, 0.08) }, minWidth: {xs: '100%', sm:'180px'} }}
                > Back to List </Button>
            )}
             {showViewHistoryButton && onViewHistory && (
                <Button variant="outlined" startIcon={<HistoryIcon />} onClick={onViewHistory}
                    sx={{ 
                        borderColor: theme.palette.info.main, 
                        color: theme.palette.info.main, 
                        '&:hover': { borderColor: darken(theme.palette.info.main, 0.15), backgroundColor: alpha(theme.palette.info.main, 0.08) }, 
                        minWidth: {xs: '100%', sm:'180px'}
                    }}
                > View Full History </Button>
            )}
            {/* Challenge Friend Button */}
            {showChallengeButton && onChallengeFriend && currentUser && ( // Added currentUser check for safety
                 <Button 
                    variant="contained" 
                    startIcon={<SportsKabaddiIcon />} 
                    onClick={onChallengeFriend}
                    sx={{ 
                        backgroundColor: theme.palette.secondary.main, 
                        color: theme.palette.getContrastText(theme.palette.secondary.main),
                        '&:hover': { backgroundColor: darken(theme.palette.secondary.main, 0.2) },
                        minWidth: {xs: '100%', sm:'180px'}
                    }}
                >
                    Challenge a Friend
                </Button>
            )}
            <Button variant="outlined" startIcon={<HomeIcon />} onClick={onNavigateHome}
                sx={{
                    borderColor: (showBackToListButton || showViewHistoryButton) ? effectiveAccentColor : theme.palette.primary.main,
                    color: (showBackToListButton || showViewHistoryButton) ? effectiveAccentColor : theme.palette.primary.main,
                    '&:hover': {
                        borderColor: darken((showBackToListButton || showViewHistoryButton) ? effectiveAccentColor : theme.palette.primary.main, 0.15),
                        backgroundColor: alpha((showBackToListButton || showViewHistoryButton) ? effectiveAccentColor : theme.palette.primary.main, 0.08)
                    },
                    minWidth: { xs: '100%', sm: '180px' }
                }}
            >
                { (showBackToListButton || showViewHistoryButton || showChallengeButton) ? "Home" : "Back to Home"}
            </Button>
            {showDeleteButton && onDeleteClick && (
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={onDeleteClick}
                    disabled={deleteDisabled}
                    sx={{ minWidth: {xs: '100%', sm:'180px'} }}
                >
                    Delete This Result
                </Button>
            )}
        </Box>
    );
}
// Add currentUser prop if not already passed to ResultsActionButtons where showChallengeButton is used
// For now, assuming ResultsPage passes it if needed implicitly through its own currentUser prop.
// A better way might be to pass currentUser to ResultsActionButtons directly.
// For this example, let's assume currentUser is available in the scope where ResultsActionButtons is called.
// However, for clarity, it's better to pass props explicitly.
// Let's assume `ResultsPage` will pass `currentUser` if it uses `showChallengeButton`.
// For now, the logic `showChallengeButton && onChallengeFriend && currentUser` implies currentUser should be available.

export default ResultsActionButtons;