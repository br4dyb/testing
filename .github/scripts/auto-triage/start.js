// @ts-check

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
    let labelsToAdd = ['Needs Review'];

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

    // Add triage labels:
    console.log('[i] Adding Triage Labels:')
    console.log(labelsToAdd.toString() || 'No labels to add...?')
    await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number,
        labels: labelsToAdd
    });

    // Post thank you comment for outside contributors:
    console.log('[i] Posting Thank You Comment:')
    await github.rest.issues.createComment({
        issue_number: issue_number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `👋 Thanks @${username} for your Contribution! One of our code reviewers will check this out as soon as possible.`
    })

    // Completed:
    console.log('-- Success!')
    return true
}