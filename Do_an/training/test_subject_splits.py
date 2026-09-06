from grid_search_weights import subject_splits


def test_subject_splits_are_disjoint():
    splits = subject_splits()
    train = set(splits["train"])
    validation = set(splits["validation"])
    test = set(splits["test"])

    assert train.isdisjoint(validation)
    assert train.isdisjoint(test)
    assert validation.isdisjoint(test)


def test_subject_split_boundaries_are_stable():
    splits = subject_splits()

    assert splits["train"][0] == "S001"
    assert splits["train"][-1] == "S070"
    assert splits["validation"][0] == "S071"
    assert splits["validation"][-1] == "S080"
    assert splits["test"][0] == "S081"
    assert splits["test"][-1] == "S090"
