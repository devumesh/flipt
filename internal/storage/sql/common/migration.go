package common

import (
	"context"

	"go.flipt.io/flipt/internal/storage"
)

func (s *Store) DeleteAllContents(ctx context.Context) error {
	_, err := s.builder.Delete("namespaces").
		ExecContext(ctx)

	if err != nil {
		return err
	}

	// insert default namespace
	_, err = s.builder.Insert("namespaces").
		Columns("\"key\"", "name", "description", "protected").
		Values(storage.DefaultNamespace, "Default", "Default namespace", true).
		ExecContext(ctx)

	return err
}
