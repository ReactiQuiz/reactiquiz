import {
    AppBar, Toolbar, Typography, IconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
function NavBar({onIconButtonClick}) {
    return (
        <AppBar position="fixed">
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onIconButtonClick}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    ReactiQuiz
                </Typography>
            </Toolbar>
        </AppBar>
    )
}

export default NavBar;