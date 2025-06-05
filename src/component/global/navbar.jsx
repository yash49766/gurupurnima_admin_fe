import { useState } from "react";
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    Container,
    useTheme,
    useMediaQuery
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";

const navLinks = [
    { label: "Samiti", href: "/" },
    { label: "Acharya", href: "/acharya" },
    { label: "Adhyaksh", href: "/adhyaksh" },
];

const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    return (
        <>
            <AppBar position="sticky" color="inherit" elevation={2}>
                <Container maxWidth="lg">
                    <Toolbar sx={{ justifyContent: "space-between" }}>
                        {/* Logo or Brand */}
                        <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: "none", color: "black", fontWeight: 600 }}>
                           Listing
                        </Typography>

                        {/* Desktop Navigation */}
                        {!isMobile && (
                            <Box sx={{ display: "flex", gap: 3 }}>
                                {navLinks.map((link, idx) => (
                                    <Typography
                                        key={idx}
                                        component={Link}
                                        to={link.href}
                                        sx={{
                                            color: "#000",
                                            fontWeight: 500,
                                            textDecoration: "none",
                                            position: "relative",
                                            fontSize: "18px",
                                            "&::after": {
                                                content: '""',
                                                position: "absolute",
                                                width: 0,
                                                height: "2px",
                                                bottom: -2,
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                backgroundColor: "#3292E7",
                                                transition: "width 0.3s ease",
                                            },
                                            "&:hover::after": {
                                                width: "100%",
                                            },
                                        }}
                                    >
                                        {link.label}
                                    </Typography>
                                ))}
                            </Box>
                        )}

                        {/* Mobile Menu Button */}
                        {isMobile && (
                            <IconButton edge="end" color="inherit" onClick={toggleDrawer(true)}>
                                <MenuIcon />
                            </IconButton>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Drawer for Mobile */}
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                <Box
                    sx={{ width: "80vw", height: "100%", display: "flex", flexDirection: "column" }}
                    role="presentation"
                >
                    <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
                        <Typography variant="h6">Menu</Typography>
                        <IconButton onClick={toggleDrawer(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <List>
                        {navLinks.map((link, index) => (
                            <ListItemButton
                                key={index}
                                component={Link}
                                to={link.href}
                                onClick={toggleDrawer(false)}
                            >
                                <ListItemText primary={link.label} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
};

export default Navbar;
