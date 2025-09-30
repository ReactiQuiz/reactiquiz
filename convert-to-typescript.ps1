# Script to convert .js files to .ts or .tsx
# This script renames .js files to .tsx for React components and .ts for utilities

$srcPath = "C:\Users\sansk\reactiquiz\src"

# Files to convert to .tsx (React components)
$tsxFiles = @(
    "components\about\AboutHeader.js",
    "components\about\ContactFormSection.js",
    "components\about\CreatorProfile.js",
    "components\account\AccountManagementActions.js",
    "components\account\AccountPageSkeleton.js",
    "components\account\UserActivityChart.js",
    "components\account\UserProfileCard.js",
    "components\admin\AdminSidebar.js",
    "components\admin\AddSubjectRow.js",
    "components\admin\ContentOverview.js",
    "components\admin\EditableSubjectRow.js",
    "components\admin\StatBox.js",
    "components\admin\SubjectsTable.js",
    "components\admin\content\JsonImportModal.js",
    "components\admin\content\ManageQuestions.js",
    "components\admin\content\ManageSubjects.js",
    "components\admin\content\ManageTopics.js",
    "components\admin\content\QuestionDetailView.js",
    "components\admin\content\TopicSummaryList.js",
    "components\auth\AuthBrandingPanel.js",
    "components\auth\ChangeDetailsModal.js",
    "components\auth\ChangePasswordModal.js",
    "components\auth\ForgotPasswordForm.js",
    "components\auth\LoginModal.js",
    "components\core\AppProviders.js",
    "components\core\NotificationManager.js",
    "components\dashboard\DashboardControls.js",
    "components\dashboard\GenerateReportButton.js",
    "components\dashboard\KpiBreakdownPieChart.js",
    "components\dashboard\KpiCards.js",
    "components\dashboard\OverallDifficultyCard.js",
    "components\dashboard\OverallStatsCards.js",
    "components\dashboard\SubjectAveragesChart.js",
    "components\dashboard\SubjectDifficultyCard.js",
    "components\dashboard\SubjectPerformanceGrid.js",
    "components\dashboard\TopicPerformanceList.js",
    "components\flashcards\FlashcardItem.js",
    "components\flashcards\FlashcardViewer.js",
    "components\home\AboutSummarySection.js",
    "components\home\CallToActionSection.js",
    "components\home\HeroSection.js",
    "components\home\HomiBhabhaSpotlight.js",
    "components\home\KeyFeaturesSection.js",
    "components\quiz\homibhabha\PracticeTestModal.js",
    "components\quiz\homibhabha\PYQPapersModal.js",
    "components\quiz\QuestionItem.js",
    "components\quiz\QuestionsPdfModal.js",
    "components\quiz\QuizHeader.js",
    "components\quiz\QuizQuestionList.js",
    "components\quiz\QuizSettingsModal.js",
    "components\results\CurrentResultView.js",
    "components\results\HistoricalResultDetailView.js",
    "components\results\HistoricalResultItem.js",
    "components\results\HistoricalResultsList.js",
    "components\results\QuestionBreakdown.js",
    "components\results\QuizResultSummary.js",
    "components\results\ResultRevealOverlay.js",
    "components\results\ResultsActionButtons.js",
    "components\results\ResultsFilters.js",
    "components\results\SubjectiveResultItem.js",
    "components\results\SubjectiveResultsList.js",
    "components\settings\ThemePanel.js",
    "components\shared\DeleteConfirmationDialog.js",
    "components\shared\EmptyState.js",
    "components\shared\MarkdownRenderer.js",
    "components\shared\SkeletonGrid.js",
    "components\shared\StatusAlert.js",
    "components\subjective\RichTextEditor.js",
    "components\topics\SubjectBreadcrumb.js",
    "components\topics\SubjectOverviewCard.js",
    "components\topics\TopicCard.js",
    "components\topics\TopicSkeletonGrid.js",
    "pages\AccountPage.js",
    "pages\AICenterPage.js",
    "pages\AllSubjectsPage.js",
    "pages\FlashcardPage.js",
    "pages\HomibhabhaPage.js",
    "pages\NotFoundPage.js",
    "pages\QuizLoadingPage.js",
    "pages\SettingsPage.js",
    "pages\SubjectivePaperPage.js",
    "pages\SubjectiveResultPage.js",
    "pages\SubjectTopicsPage.js",
    "pages\admin\ContentManagementPage.js",
    "pages\admin\GeneralSettingsPage.js",
    "pages\admin\UserManagementPage.js"
)

# Files to convert to .ts (utilities, non-React files)
$tsFiles = @(
    "adminTheme.js",
    "reportWebVitals.js",
    "setupTests.js",
    "test-utils.js",
    "hooks\useDashboardData.js",
    "utils\formatTime.js",
    "utils\getIconComponent.js",
    "utils\quizUtils.js",
    "utils\reportGenerator.js"
)

Write-Host "Starting conversion of .js files to .tsx/.ts..." -ForegroundColor Green
$convertedCount = 0
$skippedCount = 0

# Convert to .tsx
foreach ($file in $tsxFiles) {
    $jsPath = Join-Path $srcPath $file
    $tsxPath = $jsPath -replace '\.js$', '.tsx'
    
    if (Test-Path $jsPath) {
        if (!(Test-Path $tsxPath)) {
            Rename-Item -Path $jsPath -NewName (Split-Path $tsxPath -Leaf)
            Write-Host "Converted: $file -> .tsx" -ForegroundColor Cyan
            $convertedCount++
        } else {
            Write-Host "Skipped: $file (TSX already exists)" -ForegroundColor Yellow
            $skippedCount++
        }
    } else {
        Write-Host "Not found: $file" -ForegroundColor Red
    }
}

# Convert to .ts
foreach ($file in $tsFiles) {
    $jsPath = Join-Path $srcPath $file
    $tsPath = $jsPath -replace '\.js$', '.ts'
    
    if (Test-Path $jsPath) {
        if (!(Test-Path $tsPath)) {
            Rename-Item -Path $jsPath -NewName (Split-Path $tsPath -Leaf)
            Write-Host "Converted: $file -> .ts" -ForegroundColor Cyan
            $convertedCount++
        } else {
            Write-Host "Skipped: $file (TS already exists)" -ForegroundColor Yellow
            $skippedCount++
        }
    } else {
        Write-Host "Not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nConversion complete!" -ForegroundColor Green
Write-Host "Files converted: $convertedCount" -ForegroundColor Green
Write-Host "Files skipped: $skippedCount" -ForegroundColor Yellow
Write-Host "`nNote: You'll need to add TypeScript type annotations to these files manually." -ForegroundColor Magenta