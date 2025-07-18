import {useState, useEffect} from "react"
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Typography,
    IconButton,
    Grid,
    Card,
    CardContent,
    useMediaQuery,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Fade,
    Container,
    Divider,
    Stack,
    alpha,
    CircularProgress,
    Snackbar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    Chip,
} from "@mui/material"
import {Edit, Delete, Add, Person, Phone, Group, Sort, Palette} from "@mui/icons-material"
import axios from "axios"

function Samiti() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortOrder, setSortOrder] = useState("asc") // asc or desc
    const [formData, setFormData] = useState({
        samiti: "",
        name: "",
        number: "",
        color: "",
    })
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success"
    })

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

    const API_URL = "https://gurupurnima-be.onrender.com/api/samitis"

    const samitiOptions = [
        "સંકલન સમિતિ",
        "સ્ટેજ અને રંગોળી સમિતિ",
        "સાંસ્કૃતિક સમિતિ",
        "પ્રસાદી સમિતિ",
        "ગુરુ દીક્ષા/ પાદુકા પૂજન સમિતિ",
        "એન્કરીન સમિતિ",
        "સાઉન્ડ લાઈવ સમિતિ",
        "રજીસ્ટ્રેશન સમિતિ",
        "સ્વાગત સમિતિ",
        "બેઠક સમિતિ",
        "ડોનેશન સમિતિ",
        "સાહિત્ય સમિતિ",
        "ધૂપ સમિતિ",
        "રસોડા વિભાગ સમિતિ",
        "ભોજન વિતરણ સમિતિ",
        "પાણી સમિતિ",
        "પાર્કિંગ સમિતિ",
        "પગરખા સમિતિ",
        "નાઇટ સિક્યુરિટી સમિતિ",
        "વાઈન્ડ અપ સમિતિ",
    ]

    const colorOptions = [
        { label: "Main", value: "blue", hex: "#392d74" },
        { label: "Peta", value: "purple", hex: "#9f2886" }
    ]

    // Helper function to get color info from hex
    const getColorInfoFromHex = (hexColor) => {
        const colorOption = colorOptions.find(option => option.hex === hexColor)
        return colorOption || { label: "Unknown", value: "unknown", hex: hexColor }
    }

    // Helper function to get color info from value
    const getColorInfoFromValue = (colorValue) => {
        const colorOption = colorOptions.find(option => option.value === colorValue)
        return colorOption || { label: "Unknown", value: colorValue, hex: "#000000" }
    }

    // Fetch data from API
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await axios.get(API_URL)
            setData(response.data)
            setError(null)
        } catch (err) {
            console.error("Error fetching data:", err)
            setError("Failed to load data. Please try again later.")
            // If API fails, use sample data for demonstration
        } finally {
            setLoading(false)
        }
    }

    // Sort data based on samiti names
    const getSortedData = () => {
        const sortedData = [...data].sort((a, b) => {
            const aName = a.samiti.toLowerCase()
            const bName = b.samiti.toLowerCase()

            if (sortOrder === "asc") {
                return aName.localeCompare(bName)
            } else {
                return bName.localeCompare(aName)
            }
        })
        return sortedData
    }

    const handleSortChange = (event) => {
        setSortOrder(event.target.value)
    }

    const handleClick = () => {
        setEditingId(null)
        setFormData({
            samiti: "",
            name: "",
            number: "",
            color: "",
        })
        setDialogOpen(true)
    }

    const handleEdit = (id) => {
        const itemToEdit = data.find((item) => item._id === id)

        // Determine the color value to set in the form
        let colorValue = ""
        if (itemToEdit.color) {
            // Check if the color is a hex value (stored format)
            if (itemToEdit.color.startsWith("#")) {
                const colorInfo = getColorInfoFromHex(itemToEdit.color)
                colorValue = colorInfo.value
            } else {
                // If it's already a value (blue, purple, etc.)
                colorValue = itemToEdit.color
            }
        }

        setFormData({
            samiti: itemToEdit.samiti,
            name: itemToEdit.name,
            number: itemToEdit.number,
            color: colorValue,
        })
        setEditingId(id)
        setDialogOpen(true)
    }

    const handleDelete = async (id) => {
        setLoading(true)
        try {
            await axios.delete(`${API_URL}/${id}`)
            setData(data.filter((item) => item._id !== id))
            showNotification("Entry deleted successfully", "success")
        } catch (err) {
            console.error("Error deleting entry:", err)
            showNotification("Failed to delete entry", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setDialogOpen(false)
    }

    const handleChange = (e) => {
        const {name, value} = e.target

        if (name === "number") {
            // Only allow numeric input and limit to 10 digits
            const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10)
            setFormData((prev) => ({
                ...prev,
                [name]: numericValue,
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }))
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const selectedColor = colorOptions.find(option => option.value === formData.color)
            const dataToSend = {
                ...formData,
                color: selectedColor ? selectedColor.hex : formData.color
            }

            if (editingId) {
                // Update existing entry
                const response = await axios.put(`${API_URL}/${editingId}`, dataToSend)
                setData(data.map((item) => (item._id === editingId ? response.data : item)))
                showNotification("Entry updated successfully", "success")
            } else {
                // Add new entry
                const response = await axios.post(API_URL, dataToSend)
                setData([...data, response.data])
                showNotification("Entry added successfully", "success")
            }
            handleClose()
        } catch (err) {
            console.error("Error saving data:", err)
            showNotification("Failed to save data", "error")
        } finally {
            setLoading(false)
        }
    }

    const showNotification = (message, severity) => {
        setNotification({
            open: true,
            message,
            severity
        })
    }

    const handleCloseNotification = () => {
        setNotification({
            ...notification,
            open: false
        })
    }

    // Get sorted data for rendering
    const sortedData = getSortedData()

    return (
        <Box
            sx={{
                minHeight: "100vh",
                py: 4,
            }}
        >
            <Container maxWidth="lg">
                {/* Header Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        mb: 4,
                        borderRadius: 3,
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                            <Box>
                                <Typography
                                    variant="h3"
                                    fontWeight="700"
                                    sx={{
                                        background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        mb: 0.5,
                                    }}
                                >
                                    Samiti Listings
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Made by JBS Technology
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap'}}>
                            {/* Sort Control */}
                            <FormControl sx={{ minWidth: 150 }}>
                                <InputLabel>Sort By Name</InputLabel>
                                <Select
                                    value={sortOrder}
                                    label="Sort By Name"
                                    onChange={handleSortChange}
                                    startAdornment={<Sort sx={{ mr: 1, color: "text.secondary" }} />}
                                    sx={{
                                        borderRadius: 2,
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                >
                                    <MenuItem value="asc">અ થી જ્ઞ</MenuItem>
                                    <MenuItem value="desc">જ્ઞ થી અ</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<Add/>}
                                onClick={handleClick}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1.5,
                                    background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                                    boxShadow: "0 4px 15px rgba(25, 118, 210, 0.3)",
                                    "&:hover": {
                                        background: "linear-gradient(45deg, #1565c0, #1976d2)",
                                        boxShadow: "0 6px 20px rgba(25, 118, 210, 0.4)",
                                    },
                                }}
                            >
                                Add Samiti
                            </Button>
                        </Box>
                    </Stack>
                </Paper>

                {/* Content Section */}
                <Fade in timeout={500}>
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            background: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            position: "relative",
                            minHeight: "300px",
                        }}
                    >
                        {loading && (
                            <Box sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                                zIndex: 10
                            }}>
                                <CircularProgress/>
                            </Box>
                        )}

                        {error && (
                            <Box sx={{p: 3, textAlign: "center"}}>
                                <Typography color="error">{error}</Typography>
                                <Button
                                    variant="outlined"
                                    sx={{mt: 2}}
                                    onClick={fetchData}
                                >
                                    Retry
                                </Button>
                            </Box>
                        )}

                        {!loading && !error && data.length === 0 && (
                            <Box sx={{p: 5, textAlign: "center"}}>
                                <Typography variant="h6" color="text.secondary">No samiti entries found</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add/>}
                                    sx={{mt: 2}}
                                    onClick={handleClick}
                                >
                                    Add Your First Samiti
                                </Button>
                            </Box>
                        )}

                        {!loading && !error && data.length > 0 && (
                            <>
                                {/* Sort Info */}
                                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Sort sx={{ color: "primary.main" }} />
                                    <Typography variant="body2" color="primary.main" fontWeight="600">
                                        Sorted {sortOrder === "asc" ? "A to Z" : "Z to A"} • {sortedData.length} entries
                                    </Typography>
                                </Box>

                                {isMobile ? (
                                    <Box sx={{p: 2}}>
                                        {sortedData.map((row, index) => {
                                            const colorInfo = row.color ? getColorInfoFromHex(row.color) : null;
                                            return (
                                                <Fade in timeout={300 + index * 100} key={row._id}>
                                                    <Card
                                                        sx={{
                                                            mb: 2,
                                                            borderRadius: 3,
                                                            border: "1px solid",
                                                            borderColor: alpha(theme.palette.primary.main, 0.1),
                                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                            "&:hover": {
                                                                transform: "translateY(-4px)",
                                                                boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                                                                borderColor: theme.palette.primary.main,
                                                            },
                                                        }}
                                                    >
                                                        <CardContent sx={{p: 3}}>
                                                            <Stack spacing={2.5}>
                                                                <Box>
                                                                    <Typography
                                                                        variant="h6"
                                                                        fontWeight="600"
                                                                        color="primary.main"
                                                                        sx={{mb: 1}}
                                                                    >
                                                                        {row.samiti}
                                                                    </Typography>
                                                                </Box>

                                                                <Divider/>

                                                                <Box sx={{display: "flex", alignItems: "center", gap: 1.5}}>
                                                                    <Person sx={{color: "text.secondary", fontSize: 20}}/>
                                                                    <Box>
                                                                        <Typography variant="body2" color="text.secondary"
                                                                                    sx={{fontSize: "0.75rem"}}>
                                                                            Contact Person
                                                                        </Typography>
                                                                        <Typography variant="subtitle1" fontWeight="600">
                                                                            {row.name}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                <Box sx={{display: "flex", alignItems: "center", gap: 1.5}}>
                                                                    <Phone sx={{color: "text.secondary", fontSize: 20}}/>
                                                                    <Box>
                                                                        <Typography variant="body2" color="text.secondary"
                                                                                    sx={{fontSize: "0.75rem"}}>
                                                                            Mobile Number
                                                                        </Typography>
                                                                        <Typography variant="subtitle1" fontWeight="600">
                                                                            {row.number}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                {colorInfo && (
                                                                    <Box sx={{display: "flex", alignItems: "center", gap: 1.5}}>
                                                                        <Palette sx={{color: "text.secondary", fontSize: 20}}/>
                                                                        <Box>
                                                                            <Typography variant="body2" color="text.secondary"
                                                                                        sx={{fontSize: "0.75rem"}}>
                                                                                Color
                                                                            </Typography>
                                                                            <Chip
                                                                                label={colorInfo.label}
                                                                                sx={{
                                                                                    backgroundColor: colorInfo.hex,
                                                                                    color: "white",
                                                                                    fontWeight: "600",
                                                                                    mt: 0.5
                                                                                }}
                                                                                size="small"
                                                                            />
                                                                        </Box>
                                                                    </Box>
                                                                )}

                                                                <Divider/>

                                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                                    <IconButton
                                                                        onClick={() => handleEdit(row._id)}
                                                                        sx={{
                                                                            color: "primary.main",
                                                                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                                            "&:hover": {
                                                                                backgroundColor: alpha(theme.palette.primary.main, 0.16),
                                                                            },
                                                                        }}
                                                                    >
                                                                        <Edit/>
                                                                    </IconButton>
                                                                    <IconButton
                                                                        onClick={() => handleDelete(row._id)}
                                                                        sx={{
                                                                            color: "error.main",
                                                                            backgroundColor: alpha(theme.palette.error.main, 0.08),
                                                                            "&:hover": {
                                                                                backgroundColor: alpha(theme.palette.error.main, 0.16),
                                                                            },
                                                                        }}
                                                                    >
                                                                        <Delete/>
                                                                    </IconButton>
                                                                </Stack>
                                                            </Stack>
                                                        </CardContent>
                                                    </Card>
                                                </Fade>
                                            );
                                        })}
                                    </Box>
                                ) : (
                                    <TableContainer>
                                        <Table sx={{
                                            width:"100%"
                                        }}>
                                            <TableHead>
                                                <TableRow
                                                    sx={{
                                                        background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                                                    }}
                                                >
                                                    <TableCell sx={{
                                                        color: "white",
                                                        fontWeight: 700,
                                                        fontSize: "1.5rem",
                                                        textAlign: "center"
                                                    }}>
                                                        Samiti
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        color: "white",
                                                        fontWeight: 700,
                                                        fontSize: "1.5rem",
                                                        textAlign: "center"
                                                    }}>
                                                        Contact Person
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        color: "white",
                                                        fontWeight: 700,
                                                        fontSize: "1.5rem",
                                                        textAlign: "center"
                                                    }}>
                                                        Mobile Number
                                                    </TableCell>
                                                    <TableCell sx={{
                                                        color: "white",
                                                        fontWeight: 700,
                                                        fontSize: "1.5rem",
                                                        textAlign: "center"
                                                    }}>
                                                        Color
                                                    </TableCell>
                                                    <TableCell align="right" sx={{
                                                        color: "white",
                                                        fontWeight: 700,
                                                        fontSize: "1.5rem",
                                                        textAlign: "center"
                                                    }}>
                                                        Actions
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {sortedData.map((row, index) => {
                                                    const colorInfo = row.color ? getColorInfoFromHex(row.color) : null;
                                                    return (
                                                        <Fade in timeout={200 + index * 50} key={row._id}>
                                                            <TableRow
                                                                sx={{
                                                                    "&:hover": {
                                                                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                                                    },
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    <Typography fontWeight="600" color="primary.main" sx={{
                                                                        textAlign: "center",
                                                                    }}>
                                                                        {row.samiti}
                                                                    </Typography>
                                                                </TableCell>

                                                                <TableCell>
                                                                    <Typography fontWeight="600" sx={{
                                                                        textAlign: "center",
                                                                    }}>
                                                                        {row.name}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography fontWeight="500" sx={{
                                                                        textAlign: "center",
                                                                    }}>
                                                                        {row.number}
                                                                    </Typography>
                                                                </TableCell>

                                                                <TableCell sx={{ textAlign: "center" }}>
                                                                    {colorInfo ? (
                                                                        <Chip
                                                                            label={colorInfo.label}
                                                                            sx={{
                                                                                backgroundColor: colorInfo.hex,
                                                                                color: "white",
                                                                                fontWeight: "600"
                                                                            }}
                                                                            size="small"
                                                                        />
                                                                    ) : (
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            N/A
                                                                        </Typography>
                                                                    )}
                                                                </TableCell>

                                                                <TableCell align="right" sx={{
                                                                    textAlign: "center",
                                                                }}>
                                                                    <Stack direction="row" spacing={1}
                                                                           justifyContent="flex-end">
                                                                        <IconButton
                                                                            onClick={() => handleEdit(row._id)}
                                                                            sx={{
                                                                                color: "primary.main",
                                                                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                                                "&:hover": {
                                                                                    backgroundColor: alpha(theme.palette.primary.main, 0.16),
                                                                                },
                                                                            }}
                                                                        >
                                                                            <Edit/>
                                                                        </IconButton>
                                                                        <IconButton
                                                                            onClick={() => handleDelete(row._id)}
                                                                            sx={{
                                                                                color: "error.main",
                                                                                backgroundColor: alpha(theme.palette.error.main, 0.08),
                                                                                "&:hover": {
                                                                                    backgroundColor: alpha(theme.palette.error.main, 0.16),
                                                                                },
                                                                            }}
                                                                        >
                                                                            <Delete/>
                                                                        </IconButton>
                                                                    </Stack>
                                                                </TableCell>
                                                            </TableRow>
                                                        </Fade>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </>
                        )}
                    </Paper>
                </Fade>

                {/* Enhanced Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={handleClose}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            background: "linear-gradient(135deg, #1976d2, #42a5f5)",
                            color: "white",
                            textAlign: "center",
                            py: 3,
                        }}
                    >
                        <Typography variant="h5" fontWeight="600">
                            {editingId ? "Edit Samiti Entry" : "Add New Samiti"}
                        </Typography>
                    </DialogTitle>
                    <DialogContent dividers sx={{p: 3}}>
                        <Stack spacing={3} sx={{mt: 1}}>
                            <TextField
                                select
                                fullWidth
                                label="Samiti Name"
                                name="samiti"
                                value={formData.samiti}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <Group sx={{color: "text.secondary", mr: 1}}/>,
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,
                                    },
                                }}
                            >
                                {samitiOptions.map((samiti) => (
                                    <MenuItem key={samiti} value={samiti}>
                                        {samiti}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth
                                label="Person Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <Person sx={{color: "text.secondary", mr: 1}}/>,
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Mobile Number"
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                                inputProps={{
                                    maxLength: 10,
                                    pattern: "[0-9]*",
                                    inputMode: "numeric",
                                }}
                                InputProps={{
                                    startAdornment: <Phone sx={{color: "text.secondary", mr: 1}}/>,
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,
                                    },
                                }}
                                helperText={`${formData.number.length}/10 digits`}
                                error={formData.number.length > 0 && formData.number.length !== 10}
                            />
                            <TextField
                                select
                                fullWidth
                                label="Color"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <Palette sx={{color: "text.secondary", mr: 1}}/>,
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 2,
                                    },
                                }}
                            >
                                {colorOptions.map((color) => (
                                    <MenuItem key={color.value} value={color.value}>
                                        {color.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{p: 3, gap: 1}}>
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                px: 3,
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading || !formData.samiti || !formData.name || !formData.number || formData.number.length !== 10 || !formData.color}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                                "&:hover": {
                                    background: "linear-gradient(45deg, #1565c0, #1976d2)",
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit"/> : editingId ? "Update" : "Add"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Notification */}
                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                        sx={{width: '100%'}}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    )
}

export default Samiti;