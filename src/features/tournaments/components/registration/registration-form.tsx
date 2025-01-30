'use client'

import { Box, Paper, Stepper, Step, StepLabel, Container } from '@mui/material'
import { useRegistrationForm } from '../../hooks/use-registration-form'
import { CategorySelection } from './steps/category-selection'
import { PersonalDetails } from './steps/personal-details'
import { PlayerProfile } from './steps/player-profile'
import { JerseyDetails } from './steps/jersey-details'
import { PaymentDetails } from './steps/payment-details'
import { ReviewSubmit } from './steps/review-submit'
import { RegistrationStep } from '../../types/registration'

const stepComponents: Record<RegistrationStep, React.FC<{ onNext: () => void; onBack: () => void }>> = {
  category: CategorySelection,
  personal: PersonalDetails,
  profile: PlayerProfile,
  jersey: JerseyDetails,
  payment: PaymentDetails,
  review: ReviewSubmit,
}

const stepLabels: Record<RegistrationStep, string> = {
  category: 'Category Selection',
  personal: 'Personal Details',
  profile: 'Player Profile',
  jersey: 'Jersey Details',
  payment: 'Payment',
  review: 'Review & Submit',
}

export function RegistrationForm() {
  const {
    formData,
    currentStep,
    isLastStep,
    updateFormData,
    nextStep,
    prevStep,
  } = useRegistrationForm()

  const steps = Object.keys(stepLabels) as RegistrationStep[]
  const CurrentStepComponent = stepComponents[currentStep]

  return (
    <Paper elevation={3} sx={{ p: 4, my: 4 }}>
      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={steps.indexOf(currentStep)} alternativeLabel>
          {steps.map((step) => (
            <Step key={step}>
              <StepLabel>{stepLabels[step]}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <CurrentStepComponent
        onNext={nextStep}
        onBack={prevStep}
      />
    </Paper>
  )
} 