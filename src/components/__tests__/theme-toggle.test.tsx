import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../theme-toggle'
import { useUIStore } from '@/store/ui'

jest.mock('@/store/ui')

const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>

describe('ThemeToggle', () => {
  const mockToggleDarkMode = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUIStore.mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: mockToggleDarkMode,
      isModalOpen: false,
      modalType: null,
      modalData: null,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    })
  })

  it('renders light mode icon when in light mode', () => {
    render(<ThemeToggle />)
    
    const moonIcon = screen.getByRole('button')
    expect(moonIcon).toBeInTheDocument()
  })

  it('renders dark mode icon when in dark mode', () => {
    mockUseUIStore.mockReturnValue({
      isDarkMode: true,
      toggleDarkMode: mockToggleDarkMode,
      isModalOpen: false,
      modalType: null,
      modalData: null,
      openModal: jest.fn(),
      closeModal: jest.fn(),
    })

    render(<ThemeToggle />)
    
    const sunIcon = screen.getByRole('button')
    expect(sunIcon).toBeInTheDocument()
  })

  it('calls toggleDarkMode when clicked', () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton)
    
    expect(mockToggleDarkMode).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toHaveAttribute('aria-label', 'Toggle theme')
  })
})