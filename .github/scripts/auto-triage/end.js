// @ts-check

const labelsToRemove = ['Needs Review', 'Awaiting Changes' ]

/**
 * @param {object} params
 * @param {import('@octokit/rest').Octokit} params.github
 * @param {typeof import('@actions/github')['context']} params.context
 * @param {typeof import('@actions/core')} params.core
 */
module.exports = async ({github, context, core}) => {
    const org = 'SessionsBot';
    let username = context.actor
    let issue_number;
    let isOrgMember = false;
    let labelsToKeep = [];

    // Get PR/Issue Number:
    if (context.payload['pull_request']) { 
        username = context.payload.pull_request.user.login;
        issue_number = context.payload.pull_request.number;
        console.log('[i] Triage was triggered by a Pull Request...');
    } else if (context.payload['issue']) {
        username = context.payload.issue.user.login;
        issue_number = context.payload.issue.number;
        console.log('[i] Triage was triggered by a Issue...');
    } else {
        console.log('An unknown trigger/event type occurred!',);
        throw new Error("This workflow only supports issues or pull requests.");
    }

    // Get Updated Labels:
    const existingLabels = await github.rest.issues.listLabelsOnIssue({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number,
        per_page: 100
    })

    const existingLabelNames = existingLabels.data.map((label) => label.name)

    // DEBUG:
    console.log('[i] Updating Triage Labels...');
    console.log('Existing Label Names:')
    console.log(existingLabelNames)

    // Remove any labels if required:
    labelsToKeep = existingLabelNames.filter((labelName) => !labelsToRemove.includes(labelName))

    // DEBUG:
    console.log('Label Names TO KEEP:')
    console.log(labelsToKeep)

    // Update labels through REST API
    await github.rest.issues.setLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number,
        labels: labelsToKeep
    })

    // Completed:
    console.log('-- Success!')
    return true
}