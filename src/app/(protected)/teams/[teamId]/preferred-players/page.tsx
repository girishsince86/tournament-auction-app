'use client';

import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    Button,
    Stack,
    Divider
} from '@mui/material';
import { PreferredPlayersBudget } from '@/components/teams/PreferredPlayersBudget';
import { PreferredPlayersList } from '@/components/teams/PreferredPlayersList';
import { AddPreferredPlayer } from '@/components/teams/AddPreferredPlayer';
import AddIcon from '@mui/icons-material/Add';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`preferred-players-tabpanel-${index}`}
            aria-labelledby={`preferred-players-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `preferred-players-tab-${index}`,
        'aria-controls': `preferred-players-tabpanel-${index}`,
    };
}

export default function PreferredPlayersPage({ params }: { params: { teamId: string } }) {
    const [selectedTab, setSelectedTab] = useState(0);
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const handleAddPlayerSuccess = () => {
        setIsAddingPlayer(false);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="p-4">
            <Box mb={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Preferred Players for Auction
                </Typography>
                <Typography color="textSecondary">
                    Manage your preferred players list and monitor budget allocation
                </Typography>
            </Box>

            {/* Budget Analysis Section */}
            <Box mb={4}>
                <PreferredPlayersBudget 
                    teamId={params.teamId}
                    onAnalysisComplete={(analysis) => {
                        console.log('Budget analysis updated:', analysis);
                    }}
                />
            </Box>

            <Card>
                <CardContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <Tabs 
                                    value={selectedTab} 
                                    onChange={handleTabChange}
                                    aria-label="preferred players tabs"
                                >
                                    <Tab label="All Players" {...a11yProps(0)} />
                                    <Tab label="By Position" {...a11yProps(1)} />
                                    <Tab label="By Priority" {...a11yProps(2)} />
                                </Tabs>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setIsAddingPlayer(true)}
                                >
                                    Add Player
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>

                    <TabPanel value={selectedTab} index={0}>
                        <PreferredPlayersList
                            teamId={params.teamId}
                            refreshTrigger={refreshTrigger}
                            view="list"
                        />
                    </TabPanel>

                    <TabPanel value={selectedTab} index={1}>
                        <PreferredPlayersList
                            teamId={params.teamId}
                            refreshTrigger={refreshTrigger}
                            view="position"
                        />
                    </TabPanel>

                    <TabPanel value={selectedTab} index={2}>
                        <PreferredPlayersList
                            teamId={params.teamId}
                            refreshTrigger={refreshTrigger}
                            view="priority"
                        />
                    </TabPanel>
                </CardContent>
            </Card>

            {/* Add Player Dialog */}
            <AddPreferredPlayer
                open={isAddingPlayer}
                onClose={() => setIsAddingPlayer(false)}
                teamId={params.teamId}
                onSuccess={handleAddPlayerSuccess}
            />
        </div>
    );
} 