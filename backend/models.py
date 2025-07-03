# Standard library imports
from typing import List

# Third-party imports
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

# Local imports
from syft_rds.models.models import Dataset as SyftDataset, Job as SyftJob


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class Dataset(BaseSchema, SyftDataset):
    private_size: str = Field(default="0 B")
    mock_size: str = Field(default="0 B")


class Job(BaseSchema, SyftJob):
    pass


class ListDatasetsResponse(BaseSchema):
    datasets: List[Dataset]


class ListJobsResponse(BaseSchema):
    jobs: List[Job]


class ListAutoApproveResponse(BaseSchema):
    datasites: List[str]
