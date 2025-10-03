// src/components/ResultsActionButtons.js
import {
    Box, useTheme, alpha, darken
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History'; 
import LiquidGlassButton from './animations/LiquidGlassButton';
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
    const theme = useTheme();
    const effectiveAccentColor = accentColor || theme.palette.primary.main;

    return (
        <Box sx={{ mt: 4, py: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {showBackToListButton && onBackToList && (
                <LiquidGlassButton variant="secondary" size="medium" startIcon={<ArrowBackIcon />} onClick={onBackToList} sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: {xs: '100%', sm:'200px'} }}>
                    Back to List
                </LiquidGlassButton>
            )}
             {showViewHistoryButton && onViewHistory && (
                <LiquidGlassButton variant="primary" size="medium" startIcon={<HistoryIcon />} onClick={onViewHistory} sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: {xs: '100%', sm:'200px'} }}>
                    View Full History
                </LiquidGlassButton>
            )}
            {/* Challenge Friend Button Removed */}
            <LiquidGlassButton variant="accent" size="medium" startIcon={<HomeIcon />} onClick={onNavigateHome} sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { xs: '100%', sm: '220px' } }}>
                { (showBackToListButton || showViewHistoryButton) ? "Home" : "Back to Home"}
            </LiquidGlassButton>
            {showDeleteButton && onDeleteClick && (
                <LiquidGlassButton
                    variant="default"
                    size="medium"
                    startIcon={<DeleteIcon />}
                    onClick={onDeleteClick}
                    disabled={deleteDisabled}
                    sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: {xs: '100%', sm:'220px'} }}
                    color="error"
                >
                    Delete This Result
                </LiquidGlassButton>
            )}
        </Box>
    );
}

export default ResultsActionButtons;