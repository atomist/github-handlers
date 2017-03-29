import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {execute} from '@atomist/rugs/operations/PlanUtils'
import {wrap} from '@atomist/rugs/operations/CommonHandlers'
import {renderError, renderSuccess} from '@atomist/rugs/operations/messages/MessageRendering'


@CommandHandler("RemoveLabelGitHubIssue", "Remove a known label from a GitHub issue")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("remove label issue")
class RemoveLabelIssueCommand implements HandleCommand {

    @Parameter({description: "The issue number", pattern: "^.*$"})
    issue: number

    @Parameter({description: "A label to remove from an issue", pattern: "^.*$"})
    label: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    @MappedParameter("atomist://correlation_id")
    corrid: string
    
    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let exec = execute("remove-label-github-issue", this)
        plan.add(wrap(exec,`Successfully removed label from ${this.owner}/${this.repo}#${this.issue}`, this))
        return plan;
    }
}

export let command = new RemoveLabelIssueCommand()
