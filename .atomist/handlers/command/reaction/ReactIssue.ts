/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    CommandHandler,
    MappedParameter,
    Parameter,
    Secrets,
    Tags,
} from "@atomist/rug/operations/Decorators";
import {
    CommandPlan,
    HandleCommand,
    HandlerContext,
    MappedParameters,
} from "@atomist/rug/operations/Handlers";

import { handleErrors } from "@atomist/rugs/operations/CommonHandlers";

import { ReactionContent, Repository } from "../../GitHubApi";

@CommandHandler("ReactGitHubIssue", "React to a GitHub issue")
@Tags("github", "issues", "reactions")
@Secrets("github://user_token?scopes=repo")
class ReactIssueCommand implements HandleCommand {

    @Parameter({ description: "The reaction to add", pattern: "^\\+1|\\-1|laugh|confused|heart|hooray$" })
    public reaction: string;

    @Parameter({ description: "The issue number", pattern: "^\\d+$" })
    public issue: string;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter("atomist://github_api_url")
    public apiUrl: string = "https://api.github.com/";

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    public handle(ctx: HandlerContext): CommandPlan {
        const ghRepo = new Repository(this.owner, this.repo, `#{github://user_token?scopes=repo}`, this.apiUrl);
        const ghIssue = ghRepo.issue(Number(this.issue));
        const http = ghIssue.react({ content: this.reaction as ReactionContent });

        const plan = new CommandPlan();
        const execute = {
            instruction: {
                kind: "execute",
                name: "http",
                parameters: http,
            },
        };

        plan.add(handleErrors(execute, this));
        return plan;
    }
}

export let command = new ReactIssueCommand();
