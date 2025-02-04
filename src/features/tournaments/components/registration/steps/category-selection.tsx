'use client'

import { Box, Button, Card, CardContent, Typography, Grid } from '@mui/material'
import { useRegistrationForm } from '../../../hooks/use-registration-form'

interface CategorySelectionProps {
  onNext: () => void
  onBack: () => void
}

export function CategorySelection({ onNext, onBack }: CategorySelectionProps) {
  const { formData, updateFormData } = useRegistrationForm()

  const categories = [
    { id: 'mens_open', label: "Men's Open", description: 'Open division for men of all skill levels' },
    { id: 'womens_open', label: "Women's Open", description: 'Open division for women of all skill levels' },
    { id: 'mixed_open', label: 'Mixed Open', description: 'Open division for mixed teams' },
    { id: 'masters', label: 'Masters', description: 'For players aged 35 and above' },
  ]

  const handleCategorySelect = (categoryId: string) => {
    updateFormData({ registration_category: categoryId })
    onNext()
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select League Category
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Choose the category you want to participate in.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} key={category.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
                border: formData.registration_category === category.id ? '2px solid primary.main' : 'none',
              }}
              onClick={() => handleCategorySelect(category.id)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {category.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={onBack} disabled>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!formData.registration_category}
        >
          Next
        </Button>
      </Box>
    </Box>
  )
} 