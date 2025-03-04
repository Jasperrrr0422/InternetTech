
import yaml

def yaml_to_markdown(yaml_file_path, markdown_file_path):
    """
    Convert an API YAML (OpenAPI format) file to Markdown documentation.

    :param yaml_file_path: The input YAML file path
    :param markdown_file_path: The output markdown file path
    """
    with open(yaml_file_path, 'r', encoding='utf-8') as yaml_file:
        data = yaml.safe_load(yaml_file)

    # Start generating Markdown content
    markdown_content = []

    # Add API general information
    info = data.get("info", {})
    title = info.get("title", "API Documentation")
    description = info.get("description", "")
    version = info.get("version", "1.0")

    markdown_content.append(f"# {title}")
    markdown_content.append(f"**Version:** {version}")
    markdown_content.append("")
    if description:
        markdown_content.append(description)
        markdown_content.append("")

    # Process paths
    paths = data.get("paths", {})
    for path, methods in paths.items():
        markdown_content.append(f"## `{path}`")
        for method, details in methods.items():
            markdown_content.append(f"### {method.upper()}")
            summary = details.get("summary", "No summary available")
            markdown_content.append(f"**Summary:** {summary}")
            markdown_content.append("")

            # Process parameters
            parameters = details.get("parameters", [])
            if parameters:
                markdown_content.append("#### Parameters:")
                markdown_content.append("| Name | In | Type | Required | Description |")
                markdown_content.append("|------|----|------|----------|-------------|")
                for param in parameters:
                    name = param.get("name", "-")
                    param_in = param.get("in", "-")
                    param_type = param.get("schema", {}).get("type", "-")
                    required = param.get("required", False)
                    description = param.get("description", "-")
                    markdown_content.append(f"| {name} | {param_in} | {param_type} | {required} | {description} |")
                markdown_content.append("")
            else:
                markdown_content.append("No parameters.\n")

            # Process responses
            responses = details.get("responses", {})
            if responses:
                markdown_content.append("#### Responses:")
                for status_code, response in responses.items():
                    description = response.get("description", "No description available")
                    markdown_content.append(f"- **{status_code}**: {description}")
            markdown_content.append("")

    # Write to Markdown file
    with open(markdown_file_path, 'w', encoding='utf-8') as md_file:
        md_file.write("\n".join(markdown_content))

    print(f"Markdown file generated at {markdown_file_path}")


# Example usage:
# Replace 'api.yaml' with your YAML file and 'api.md' with your desired Markdown output
yaml_to_markdown("backend/EasyBook API.yaml", "api.md")
