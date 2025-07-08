#!/bin/bash

# EaseMyResearch.com Playwright Test Execution Script
# This script provides easy commands to run different types of tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         EaseMyResearch.com Playwright Test Runner             ║"
echo "║              Comprehensive Testing Framework                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "${CYAN}🔷 $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js version: $(node --version)"
}

# Check if dependencies are installed
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not installed. Installing now..."
        npm install
    fi
    
    print_success "Dependencies are installed"
}

# Install Playwright browsers
install_browsers() {
    print_step "Installing Playwright browsers..."
    npm run install:deps
    print_success "Playwright browsers installed"
}

# Function to run tests with specific parameters
run_tests() {
    local test_type="$1"
    local description="$2"
    local command="$3"
    
    echo
    print_step "Running $description..."
    echo -e "${YELLOW}Command: $command${NC}"
    echo
    
    eval "$command"
    
    if [ $? -eq 0 ]; then
        print_success "$description completed successfully!"
    else
        print_error "$description failed!"
        exit 1
    fi
}

# Show usage information
show_help() {
    echo -e "${CYAN}Usage: $0 [OPTION]${NC}"
    echo
    echo "Available options:"
    echo "  setup          - Install dependencies and browsers"
    echo "  all            - Run all tests (default)"
    echo "  homepage       - Run homepage tests only"
    echo "  smoke          - Run smoke tests only"
    echo "  critical       - Run critical tests only"
    echo "  chromium       - Run tests on Chromium only"
    echo "  firefox        - Run tests on Firefox only"
    echo "  webkit         - Run tests on WebKit (Safari) only"
    echo "  mobile         - Run tests on mobile devices"
    echo "  headed         - Run tests in headed mode (visible browser)"
    echo "  debug          - Run tests in debug mode"
    echo "  ui             - Run tests with Playwright UI"
    echo "  report         - Show test report"
    echo "  clean          - Clean test results and reports"
    echo "  help           - Show this help message"
    echo
    echo "Examples:"
    echo "  $0 setup       # Setup everything"
    echo "  $0 homepage    # Test homepage only"
    echo "  $0 headed      # Run with visible browser"
    echo "  $0 debug       # Debug mode for development"
}

# Main script logic
main() {
    local action="${1:-all}"
    
    case "$action" in
        "setup")
            print_step "Setting up EaseMyResearch.com test environment..."
            check_node
            check_dependencies
            install_browsers
            print_success "Setup completed! You can now run tests."
            echo
            print_info "Try: $0 homepage"
            ;;
            
        "all")
            check_node
            check_dependencies
            run_tests "all" "All Tests" "npm run test"
            ;;
            
        "homepage")
            check_node
            check_dependencies
            run_tests "homepage" "Homepage Tests" "npm run test:homepage"
            ;;
            
        "smoke")
            check_node
            check_dependencies
            run_tests "smoke" "Smoke Tests" "npm run test:smoke"
            ;;
            
        "critical")
            check_node
            check_dependencies
            run_tests "critical" "Critical Tests" "npm run test:critical"
            ;;
            
        "chromium")
            check_node
            check_dependencies
            run_tests "chromium" "Chromium Tests" "npm run test:chromium"
            ;;
            
        "firefox")
            check_node
            check_dependencies
            run_tests "firefox" "Firefox Tests" "npm run test:firefox"
            ;;
            
        "webkit")
            check_node
            check_dependencies
            run_tests "webkit" "WebKit Tests" "npm run test:webkit"
            ;;
            
        "mobile")
            check_node
            check_dependencies
            run_tests "mobile" "Mobile Tests" "npm run test:mobile"
            ;;
            
        "headed")
            check_node
            check_dependencies
            run_tests "headed" "Headed Mode Tests" "npm run test:headed"
            ;;
            
        "debug")
            check_node
            check_dependencies
            print_info "Starting debug mode..."
            npm run test:debug
            ;;
            
        "ui")
            check_node
            check_dependencies
            print_info "Starting Playwright UI mode..."
            npm run test:ui
            ;;
            
        "report")
            if [ -d "playwright-report" ]; then
                print_step "Opening test report..."
                npm run report
            else
                print_warning "No test report found. Run tests first."
            fi
            ;;
            
        "clean")
            print_step "Cleaning test results and reports..."
            npm run clean
            print_success "Cleanup completed"
            ;;
            
        "help")
            show_help
            ;;
            
        *)
            print_error "Unknown option: $action"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

# Final message
if [ "$1" != "help" ] && [ "$1" != "setup" ]; then
    echo
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
    print_info "View detailed results: npm run report"
    print_info "Test files location: tests/functional/"
    print_info "For help: $0 help"
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
fi