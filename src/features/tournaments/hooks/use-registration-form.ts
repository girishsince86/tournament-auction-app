import { useState } from 'react'
import { RegistrationFormData, RegistrationStep, initialFormData } from '../types/registration'

interface UseRegistrationForm {
  formData: RegistrationFormData
  currentStep: RegistrationStep
  isLastStep: boolean
  updateFormData: (data: Partial<RegistrationFormData>) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: RegistrationStep) => void
  resetForm: () => void
}

export function useRegistrationForm(): UseRegistrationForm {
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData)
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('category')

  const steps: RegistrationStep[] = ['category', 'personal', 'profile', 'jersey', 'payment', 'review']
  const currentStepIndex = steps.indexOf(currentStep)
  const isLastStep = currentStepIndex === steps.length - 1

  const updateFormData = (data: Partial<RegistrationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (!isLastStep) {
      setCurrentStep(steps[currentStepIndex + 1])
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1])
    }
  }

  const goToStep = (step: RegistrationStep) => {
    if (steps.includes(step)) {
      setCurrentStep(step)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setCurrentStep('category')
  }

  return {
    formData,
    currentStep,
    isLastStep,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
  }
} 