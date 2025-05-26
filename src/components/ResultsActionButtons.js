import {
    Box, Button, useTheme, alpha, darken
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';

function ResultsActionButtons({
    onBackToList,
    onNavigateHome,
    showBackToListButton,
    accentColor,
    showDeleteButton,
    onDeleteClick,
    deleteDisabled
}) {
    const theme = useTheme();
    const effectiveAccentColor = accentColor || theme.palette.primary.main;

    return (
        <Box sx={{ mt: 4, py: 2, display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {showBackToListButton && onBackToList && (
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBackToList}
                    sx={{ borderColor: effectiveAccentColor, color: effectiveAccentColor, '&:hover': { borderColor: darken(effectiveAccentColor, 0.15), backgroundColor: alpha(effectiveAccentColor, 0.08) }, minWidth: '180px' }}
                > Back to List </Button>
            )}
            <Button variant="outlined" startIcon={<HomeIcon />} onClick={onNavigateHome}
                sx={{
                    borderColor: showBackToListButton ? effectiveAccentColor : theme.palette.primary.main,
                    color: showBackToListButton ? effectiveAccentColor : theme.palette.primary.main,
                    '&:hover': {
                        borderColor: darken(showBackToListButton ? effectiveAccentColor : theme.palette.primary.main, 0.15),
                        backgroundColor: alpha(showBackToListButton ? effectiveAccentColor : theme.palette.primary.main, 0.08)
                    },
                    minWidth: { xs: '100%', sm: '180px' }
                }}
            >
                {showBackToListButton ? "Home" : "Back to Home"}
            </Button>
            {showDeleteButton && onDeleteClick && (
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={onDeleteClick}
                    disabled={deleteDisabled}
                    sx={{ minWidth: '180px' }}
                >
                    Delete This Result
                </Button>
            )}
        </Box>
    );
}

export default ResultsActionButtons;