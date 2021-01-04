import React, { Component, MouseEvent } from 'react';
import {render} from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {ApolloClient, HttpLink, InMemoryCache} from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import { useQuery, gql } from '@apollo/client';
import { useForm } from "react-hook-form";

const GITHUB_BASE_URL = 'https://api.github.com/graphql';
type getBearer = {
    bearer: string;
}
const GetBearerToken = () => {

    const {register,handleSubmit} = useForm<getBearer>();


    const onSubmit = (data: getBearer) => {
        const t = data.bearer.toString();
        return(t);
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} id="bearerForm">
            <div className="field">
                <label htmlFor="bearer">bearer token</label>
                <input
                    type="text"
                    id="bearer"
                    name="bearer"
                    ref={register}
                />
            </div>

            <input type="submit"/>
        </form>
    );
};
const httpLink = new HttpLink({
    uri: GITHUB_BASE_URL,
    headers: {
        authorization: `Bearer ${
         //   GetBearerToken
        'e9f294bb04821a25932718b32a82ec1f64b6530a'
        }`,
    },
});
const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
});



type repository = {
    login: String;
    repo: String;
    query;
}
export const RepositoryForm = () => {
    // @ts-ignore
    const {register,handleSubmit} = useForm<repository>();


    const onSubmit = (data: repository) => {
        //render(<Issuer login={data.login} repository={data.repo} query={GET_OPEN_ISSUES}/>,document.getElementById('content'));
        render(<ButtonClicker login={data.login} repository={data.repo} query={data.query}/>,document.getElementById('buttons'));
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} id="repoForm">
            <div className="field">
                <label htmlFor="login">login</label>
                <input
                    type="text"
                    id="login"
                    name="login"
                    ref={register}
                />
            </div>
            <div className="field">
                <label htmlFor="repo">repository</label>
                <input
                    type="text"
                    id="repo"
                    name="repo"
                    ref={register}
                />
            </div>
            <div className="field">
                <input type="submit"/>
            </div>

        </form>
    );
};

//'e9f294bb04821a25932718b32a82ec1f64b6530a';




let GET_OPEN_ISSUES = gql`
    query GetIssues($login: String!, $repository: String!) {
        repositoryOwner(login: $login ) {
            id
            repository(name: $repository ) {
                id
                issues(first: 10,states: OPEN) {
                    edges{
                        node{
                            id
                            url
                            bodyHTML
                            comments(first:10){
                                edges{
                                    node{
                                        id
                                        bodyHTML
                                        reactions(first:10){
                                            edges{
                                                node{
                                                    id
                                                    content
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                        }
                    }

                }

            }
        }
    }
`;
let GET_PULL_REQUESTS=gql`
    query GetRequests($login: String!, $repository: String!) {
        repositoryOwner(login: $login ) {
            id
            repository(name: $repository ) {
                id
                pullRequests(first:10){
                    edges{
                        node{
                            url
                            bodyHTML
                        }
                    }
                }
            }
        }
    }`;
let GET_CLOSED_ISSUES = gql`
    query GetIssues($login: String!, $repository: String!) {
        repositoryOwner(login: $login ) {
            id
            repository(name: $repository ) {
                id
                    issues(first: 10,states: CLOSED) {
                        edges{
                            node{
                                id
                                url
                                bodyHTML
                                comments(first:10){
                                    edges{
                                        node{
                                            id
                                            bodyHTML
                                            reactions(first:10){
                                                edges{
                                                    node{
                                                        id
                                                        content
                                                    }
                                                }
                                            }

                                        }
                                    }
                                }
                            }
                        }

                    }

                }
            }
        }`;

function IssueList( values: { login,repository,query }) {


    const { loading, error, data } = useQuery(values.query, {
        variables: { login: values.login, repository: values.repository }});
    if (loading) return <p>loading...</p>;
    if (error) return <p>${error}</p>;

    console.log(data);
    return (
        <table>
            <thead>
            <tr>
                <th>URL</th>
                <th>Text</th>
            </tr>
            </thead>
            <tbody>
            {data && data.repositoryOwner.repository.issues.edges.map(edge => (
                <tr>
                    <td>{edge.node.url}</td>
                    <td dangerouslySetInnerHTML={{__html:edge.node.bodyHTML}}>
                    </td>
                    <td><button value="GET_COMMENTS" onClick={(event: React.MouseEvent<HTMLElement>) => {
                        render(<Commenter login={values.login} repository={values.repository} id={edge.node.id} />,document.getElementById('comment'))}}>
                        Get Open Issues</button></td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
let GET_COMMENTS = gql`
query GetComments($login:String!,$repository:String!,$id: String!){
    repositoryOwner(login: $login ) {
        id
        repository(name: $repository ) {
            id
            issues(id: $id) {
                edges{
                    node{
                        id
                        url
                        bodyHTML
                        comments(first:10){
                            edges{
                                node{
                                    id
                                    url
                                    bodyText
                                    reactions(first:10){
                                        edges{
                                            node{
                                                id
                                                content
                                            }
                                        }
                                    }

                                }
                            }
                        }
                    }
                }

            }

        }
    }
}`;

function IssueComments(values){
    const { loading, error, data } = useQuery(GET_COMMENTS, {
        variables: { login: values.login, repository: values.repository, id: values.id}});
    if (loading) return <p>loading...</p>;
    if (error) return <p>${error}</p>;
    return (
        <table>
            <thead>
            <tr>
                <th>URL</th>
                <th>Text</th>
            </tr>
            </thead>
            <tbody>
            {data && data.repositoryOwner.repository.issues.comments.edges.map(edge => (
                <tr>
                    <td>{edge.node.url}</td>
                    <td>{edge.node.bodyText}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
function PullList( values: { login,repository,query }) {


    const { loading, error, data } = useQuery(values.query, {
        variables: { login: values.login, repository: values.repository }});
    if (loading) return <p>loading...</p>;
    if (error) return <p>${error}</p>;

    console.log(data);
    return (
        <table>
            <thead>
            <tr>
                <th>URL</th>
                <th>Text</th>
            </tr>
            </thead>
            <tbody>
            {data && data.repositoryOwner.repository.pullRequests.edges.map(edge => (
                <tr>
                    <td>{edge.node.url}</td>
                    <td dangerouslySetInnerHTML={{__html:edge.node.bodyHTML}}></td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}




function Start(){
    return(
        <div>
            <GetBearerToken/>
        </div>
    );
}
function Main() {

    return (
        <ApolloProvider client={client}>
            <div>
                <h2>My first Apollo app 🚀</h2>

                <RepositoryForm/>
            </div>
        </ApolloProvider>
    );
}

function Issuer(values ){

    return(<ApolloProvider client={client}>
        <div>
            <IssueList login={values.login.toString()} repository={values.repository.toString()} query={values.query} />
        </div>
    </ApolloProvider>);
}
function Puller(values ){

    return(<ApolloProvider client={client}>
        <div>
            <PullList login={values.login.toString()} repository={values.repository.toString()} query={values.query} />
        </div>
    </ApolloProvider>);
}
function Commenter(values ){
    return(<ApolloProvider client={client}>
        <div>
            <IssueComments login={values.login.toString()} repository={values.repository.toString()} id={values.id} />
        </div>
    </ApolloProvider>);
}
export function ButtonClicker(data){

        return(
            <div className="field">
                <button value="GET_OPEN_ISSUES" onClick={(event: React.MouseEvent<HTMLElement>) => {
                    render(<Issuer login={data.login} repository={data.repository} query={GET_OPEN_ISSUES}/>,document.getElementById('content'))}}>
                    Get Open Issues</button>
                <button value="GET_CLOSED_ISSUES" onClick={(event: React.MouseEvent<HTMLElement>) => {
                    render(<Issuer login={data.login} repository={data.repository} query={GET_CLOSED_ISSUES}/>,document.getElementById('content'))}}>
                    Get Closed Issues</button>
                <button value="GET_PULL_REQUESTS" onClick={(event: React.MouseEvent<HTMLElement>) => {
                    render(<Puller login={data.login} repository={data.repository} query={GET_PULL_REQUESTS}/>,document.getElementById('content'))}}>
                    Get PullRequests</button>
            </div>
        );

}
render(<Start/>,document.getElementById('start'));
render(<Main />, document.getElementById('root'));




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);