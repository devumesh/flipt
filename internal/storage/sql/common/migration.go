package common

import (
	"context"
)

func (s *Store) DeleteAllContents(ctx context.Context) error {
	_, err := s.builder.Delete("namespaces").
		ExecContext(ctx)

	return err
}
