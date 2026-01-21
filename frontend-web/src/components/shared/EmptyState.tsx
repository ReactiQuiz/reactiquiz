// src/components/shared/EmptyState.tsx
/**
 * Empty State Component
 * 
 * This component displays an empty state message when there is no content
 * to display. It shows an icon, title, message, and optionally an action button.
 * Used throughout the application to indicate empty lists or missing data.
 */
import { Paper, Typography, Button } from '@mui/material';

/**
 * Empty State Component
 * 
 * Displays an empty state UI with:
 * - Large icon for visual representation
 * - Title text
 * - Descriptive message
 * - Optional action button
 * 
 * This component is used when:
 * - A list is empty (no results, no items)
 * - Content hasn't been loaded yet
 * - User needs guidance on what to do next
 * 
 * @param {Object} props - Component props
 * @param {React.ComponentType} props.IconComponent - Icon component to display
 * @param {string} props.title - Title text for the empty state
 * @param {string} props.message - Description message
 * @param {string} [props.actionText] - Text for the action button (optional)
 * @param {() => void} [props.onActionClick] - Callback for action button click (optional)
 * @returns {JSX.Element} Empty state component with icon, text, and optional button
 */
function EmptyState({ IconComponent, title, message, actionText, onActionClick }) {
    return (
        <Paper
            elevation={2}
            sx={{
                p: { xs: 3, sm: 4 }, // Responsive padding
                textAlign: 'center',
                mt: 4,
                mx: 'auto', // Center horizontally
                maxWidth: '600px', // Maximum width
            }}
        >
            {/* Icon Component - Large icon for visual emphasis */}
            <IconComponent sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            
            {/* Title */}
            <Typography variant="h6" gutterBottom>{title}</Typography>
            
            {/* Message */}
            <Typography sx={{ mb: 3, color: 'text.secondary' }}>{message}</Typography>
            
            {/* Optional Action Button
                Only renders if both actionText and onActionClick are provided */}
            {onActionClick && actionText && (
                <Button variant="contained" onClick={onActionClick}>
                    {actionText}
                </Button>
            )}
        </Paper>
    );
}

export default EmptyState;