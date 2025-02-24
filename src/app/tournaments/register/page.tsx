import { RegistrationClosedBanner } from '@/features/tournaments/components/registration/registration-closed-banner';
import { Box, Container } from '@mui/material';

export default function RegistrationPage() {
    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <RegistrationClosedBanner />
            </Box>
        </Container>
    );
} 